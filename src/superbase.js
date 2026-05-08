import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://inzgyxyoecdpdzpdqbvh.supabase.co/rest/v1/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imluemd5eHlvZWNkcGR6cGRxYnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTM5NTEsImV4cCI6MjA5MzgyOTk1MX0.-B39wiuXE3_oYiNJhDtW7cm61ozRCFK9y15xoEf_yus"
);