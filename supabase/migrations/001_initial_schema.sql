-- =============================================
-- MMC-ManageMoney: Database Schema & RLS Policies
-- =============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- =============================================

-- =============================================
-- BAGIAN 1: BUAT SEMUA TABEL DULU
-- =============================================

-- 1. TABEL PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL GROUPS
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kode_undangan TEXT NOT NULL UNIQUE,
  dibuat_oleh UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL GROUP_MEMBERS (relasi many-to-many)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 4. TABEL TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  peminjam_id UUID REFERENCES profiles(id) NOT NULL,
  pemberi_pinjaman_id UUID REFERENCES profiles(id) NOT NULL,
  jumlah BIGINT NOT NULL CHECK (jumlah > 0),
  keterangan TEXT,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'belum_lunas' CHECK (status IN ('belum_lunas', 'lunas')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (peminjam_id != pemberi_pinjaman_id)
);


-- =============================================
-- BAGIAN 2: ENABLE RLS & BUAT POLICIES
-- (Setelah semua tabel sudah ada)
-- =============================================

-- PROFILES RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- GROUPS RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can find groups"
  ON groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = dibuat_oleh);

-- GROUP_MEMBERS RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- TRANSACTIONS RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions of their groups"
  ON transactions FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id FROM group_members gm WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions in their groups"
  ON transactions FOR INSERT TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT gm.group_id FROM group_members gm WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions in their groups"
  ON transactions FOR UPDATE TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id FROM group_members gm WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions in their groups"
  ON transactions FOR DELETE TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id FROM group_members gm WHERE gm.user_id = auth.uid()
    )
  );


-- =============================================
-- BAGIAN 3: INDEXES & TRIGGER
-- =============================================

CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON transactions(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_tanggal ON transactions(tanggal);
CREATE INDEX IF NOT EXISTS idx_groups_kode_undangan ON groups(kode_undangan);

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nama, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
