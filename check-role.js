import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oqslvwynlppuacdrhlxl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xc2x2d3lubHBwdWFjZHJobHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTk2NDksImV4cCI6MjA1OTMzNTY0OX0.YUDoy6pOBCbxNKzkRr1rVP8ZQmzj-ECGeuC2wEIYUvo";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkAdmin() {
  const email = "arunkm158@gmail.com";
  const password = "testpassword123";

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (authErr) {
    console.log("Auth Error:", authErr.message);
    return;
  }
  
  const user = authData.user;
  console.log("User ID:", user.id);
  
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profErr) {
    console.log("Profile Error:", profErr.message);
  } else {
    console.log("Profile:", profile);
  }
}

checkAdmin();
