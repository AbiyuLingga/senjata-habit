import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lsglzvjfdmdedsyrrwdo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZ2x6dmpmZG1kZWRzeXJyd2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MTc3MDIsImV4cCI6MjA1MzI5MzcwMn0.4AX_EyE-xVTZQNZTwQX_-HfpVNw7sBNXxQTBCfyWEiA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
