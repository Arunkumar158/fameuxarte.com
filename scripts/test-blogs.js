import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

const url = "https://oqslvwynlppuacdrhlxl.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xc2x2d3lubHBwdWFjZHJobHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTk2NDksImV4cCI6MjA1OTMzNTY0OX0.YUDoy6pOBCbxNKzkRr1rVP8ZQmzj-ECGeuC2wEIYUvo";

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false }).limit(2);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Blogs Data:", JSON.stringify(data, null, 2));
  }
}

test();
