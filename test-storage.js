import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oqslvwynlppuacdrhlxl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xc2x2d3lubHBwdWFjZHJobHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTk2NDksImV4cCI6MjA1OTMzNTY0OX0.YUDoy6pOBCbxNKzkRr1rVP8ZQmzj-ECGeuC2wEIYUvo";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkStorage() {
  console.log("Checking artworks bucket...");
  const { data, error } = await supabase.storage.from('artworks').list('', { limit: 10 });
  
  if (error) {
    console.error("Error listing files:", error);
    return;
  }
  
  console.log("Files found in root of artworks bucket:", data);
}

checkStorage();
