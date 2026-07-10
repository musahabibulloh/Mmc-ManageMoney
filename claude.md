## Konteks

Saya dan sekelompok teman selama ini mencatat utang-piutang secara manual pakai spreadsheet, dalam bentuk matriks: baris = orang yang **punya utang**, kolom = orang yang **dipinjami/meminjamkan**. Contoh: jika di baris "DAYAT" dan kolom "RIDHO" tertulis 37.500, artinya **DAYAT berutang ke RIDHO sebesar Rp37.500**.

Saya ingin ini diubah menjadi aplikasi mobile (Android & iOS) yang lebih praktis.

## Tujuan Aplikasi

Buatkan aplikasi mobile untuk mencatat dan mengelola utang-piutang di dalam grup pertemanan kecil (5–15 orang), dengan setiap orang punya akun/login masing-masing.

## Tech Stack yang Disarankan

- **Framework**: React Native (dengan Expo) — agar bisa build ke Android & iOS dari satu codebase.
- **Backend & Database**: Supabase (Auth + Postgres Database) — database relasional (Postgres) yang cocok untuk data terstruktur seperti transaksi utang-piutang, sudah termasuk Authentication, dan mendukung Row Level Security (RLS) supaya tiap user hanya bisa mengakses data grupnya sendiri.
- **State management**: React Context atau Zustand (secukupnya, jangan over-engineer untuk app sekecil ini).

(Jika agent punya alternatif yang lebih simpel untuk dijalankan/deploy sendiri oleh orang non-teknis, boleh diusulkan, tapi jelaskan trade-off-nya.)

## Fitur Wajib

### 1. Autentikasi
- Setiap anggota grup punya akun sendiri (email + password, atau nomor HP + OTP).
- Setelah daftar, user bisa join ke satu "grup" (misalnya lewat kode undangan) — karena aplikasi ini dipakai oleh satu circle pertemanan tertentu.

### 2. Catat Transaksi Utang
- Form input: **siapa meminjam**, **siapa meminjamkan**, **jumlah**, **keterangan (opsional)**, **tanggal**.
- User bisa mencatat baik saat dia yang meminjam maupun saat dia yang meminjamkan (dengan validasi/konfirmasi dari pihak lain jika ingin lebih akurat — boleh fitur "konfirmasi transaksi" di versi lanjutan, tapi untuk versi awal cukup dicatat langsung).

### 3. Riwayat Transaksi
- Daftar semua transaksi utang-piutang, bisa difilter per orang, per status (lunas/belum), atau per tanggal.
- Tiap transaksi bisa ditandai **"sudah lunas"**.

### 4. Ringkasan Saldo (Net Balance)
- Halaman ringkasan yang menunjukkan, untuk tiap pasangan orang, **berapa saldo bersihnya** (jika A berutang ke B Rp50.000 dan B berutang ke A Rp20.000, tampilkan cukup "A berutang ke B Rp30.000").
- Tampilkan juga total: "Saya berutang ke siapa saja dan berapa" serta "Siapa saja yang berutang ke saya".

### 5. Notifikasi/Pengingat
- Reminder sederhana (push notification atau in-app) untuk utang yang belum lunas, misalnya setelah beberapa hari/minggu.

### 6. Tampilan Matriks (opsional, sesuai kebiasaan lama)
- Sediakan juga tampilan tabel/matriks seperti spreadsheet lama (baris = peminjam, kolom = pemberi pinjaman) sebagai opsi "advanced view", supaya transisi dari kebiasaan manual ke aplikasi lebih mulus.

## Struktur Data (contoh, boleh disesuaikan agent — tabel Postgres di Supabase)

```
-- profiles (terhubung ke auth.users bawaan Supabase)
profiles: { id (uuid, ref auth.users), nama, email }

-- groups
groups: { id, nama, kode_undangan, dibuat_oleh, created_at }

-- group_members (relasi many-to-many antara profiles & groups)
group_members: { id, group_id (fk), user_id (fk), joined_at }

-- transactions
transactions: {
  id, group_id (fk),
  peminjam_id (fk -> profiles.id),
  pemberi_pinjaman_id (fk -> profiles.id),
  jumlah, keterangan, tanggal,
  status: "belum_lunas" | "lunas",
  created_at
}
```

**Row Level Security (RLS):** aktifkan RLS di semua tabel, dengan policy agar user hanya bisa melihat/mengubah data pada grup di mana dia terdaftar sebagai anggota (cek lewat tabel `group_members`).

## Alur Kerja yang Diinginkan dari Agent

1. Setup project (Expo + Supabase client), termasuk struktur folder yang rapi.
2. Setup skema database di Supabase (tabel-tabel di atas) beserta RLS policy-nya, tuliskan sebagai SQL migration yang bisa saya jalankan lewat Supabase SQL Editor.
3. Implementasi autentikasi (Supabase Auth) & manajemen grup (buat grup, join lewat kode undangan).
4. Implementasi CRUD transaksi.
5. Implementasi logika perhitungan saldo bersih (net balance) antar anggota.
6. Buat UI yang simpel, jelas, dan mudah dipakai (bukan orang teknis) — gunakan komponen besar, warna kontras jelas untuk status lunas/belum lunas (misalnya hijau vs merah).
7. Berikan instruksi cara menjalankan aplikasi di device (Expo Go) dan cara build APK/IPA untuk didistribusikan ke teman-teman.

## Catatan Tambahan

- Prioritaskan kesederhanaan: ini aplikasi untuk dipakai circle pertemanan kecil, bukan produk komersial. Hindari fitur berlebihan di versi pertama.
- Pastikan perhitungan saldo bersih benar-benar akurat karena ini menyangkut uang sungguhan.
- Jelaskan setiap langkah setup yang perlu saya lakukan secara manual (misalnya membuat project di Supabase, mengambil API key & URL project, menjalankan SQL migration, mengaktifkan Authentication, dsb) karena saya mungkin bukan seorang developer.