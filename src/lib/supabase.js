import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqpqnqswuzsucchweujj.supabase.co';
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcHFucXN3dXpzdWNjaHdldWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NDk0MTUsImV4cCI6MjA4ODUyNTQxNX0.lDMb04rTSGZ3w3xW_Wn0dkzu2-miqnlCTmJIYJcIvc4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
