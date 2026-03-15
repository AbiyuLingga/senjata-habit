import { createClient } from "@supabase/supabase-js";

// Use environment variables if set (recommended for production),
// otherwise fall back to the hardcoded project keys.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://lsglzvjfdmdedsyrrwdo.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_BNu4o26ERC6etXuLXPBWpQ_pnCfULwB";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
