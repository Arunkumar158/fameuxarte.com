import { createClient } from '@supabase/supabase-js';

const url = "https://oqslvwynlppuacdrhlxl.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xc2x2d3lubHBwdWFjZHJobHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTk2NDksImV4cCI6MjA1OTMzNTY0OX0.YUDoy6pOBCbxNKzkRr1rVP8ZQmzj-ECGeuC2wEIYUvo";
const supabase = createClient(url, key);

async function testUpdate() {
  const id = "de93eeac-b3f7-47f9-ac45-318477982196"; // the first blog
  
  const payload = {
    key_takeaways: ["Test takeaway 1", "Test takeaway 2"],
    faq: [{ question: "Test Q?", answer: "Test A" }]
  };
  
  const { data, error } = await supabase.from('blogs').update(payload).eq('id', id).select().single();
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Updated Data:", JSON.stringify(data, null, 2));
  }
}

testUpdate();
