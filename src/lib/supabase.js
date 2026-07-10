import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfahvwmqcznfhzbsnijf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYWh2d21xY3puZmh6YnNuaWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjQ2NjYsImV4cCI6MjA5OTI0MDY2Nn0.La-RLsWC9hL8DHmF3gr2DyZni2KOgp0PuIgaQ9tzBNo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
