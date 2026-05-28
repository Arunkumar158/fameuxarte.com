import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oqslvwynlppuacdrhlxl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xc2x2d3lubHBwdWFjZHJobHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTk2NDksImV4cCI6MjA1OTMzNTY0OX0.YUDoy6pOBCbxNKzkRr1rVP8ZQmzj-ECGeuC2wEIYUvo";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testAuth() {
  const email = "arunkm158@gmail.com";
  const password = "testpassword123";

  console.log("Testing signin...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  console.log("SignIn Error:", signInError?.message || signInError);

  console.log("Testing signup with a random email...");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: "test.random.123456@gmail.com",
    password: "testpassword123",
  });
  console.log("SignUp Error:", signUpError?.message || signUpError);
}

testAuth();
