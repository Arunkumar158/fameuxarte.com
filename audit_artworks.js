import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oqslvwynlppuacdrhlxl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xc2x2d3lubHBwdWFjZHJobHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTk2NDksImV4cCI6MjA1OTMzNTY0OX0.YUDoy6pOBCbxNKzkRr1rVP8ZQmzj-ECGeuC2wEIYUvo";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function isValidNumber(val) {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && typeof val !== 'boolean';
}

async function audit() {
  console.log("Fetching all artworks...");
  let allArtworks = [];
  let page = 0;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase.from('artworks').select('id, dimensions').range(page * 1000, (page + 1) * 1000 - 1);
    if (error) {
      console.error("Error fetching artworks:", error);
      return;
    }
    allArtworks = allArtworks.concat(data);
    if (data.length < 1000) hasMore = false;
    page++;
  }

  let stats = {
    totalRecords: allArtworks.length,
    withDimensionsJson: 0,
    width: { valid: 0, invalid: 0, negative: 0 },
    height: { valid: 0, invalid: 0, negative: 0 },
    depth: { valid: 0, invalid: 0, negative: 0 },
    unit: { known: 0, unknown: 0, missing: 0 }
  };
  
  const knownUnits = ['in', 'inch', 'inches', 'cm', 'centimeter', 'centimeters'];

  allArtworks.forEach(art => {
    if (art.dimensions && typeof art.dimensions === 'object') {
      stats.withDimensionsJson++;
      const dim = art.dimensions;

      ['width', 'height', 'depth'].forEach(field => {
        const val = dim[field];
        if (val === null || val === undefined || val === '') {
          // not present
        } else {
          if (isValidNumber(val)) {
            const num = Number(val);
            if (num < 0) {
              stats[field].negative++;
            } else {
              stats[field].valid++;
            }
          } else {
            stats[field].invalid++;
            if (field === 'width') console.log(`Invalid width example: "${val}" in artwork ${art.id}`);
          }
        }
      });
      
      const unit = dim.unit;
      if (unit === null || unit === undefined || unit === '') {
        stats.unit.missing++;
      } else {
        const unitStr = String(unit).trim().toLowerCase();
        if (knownUnits.includes(unitStr)) {
          stats.unit.known++;
        } else {
          stats.unit.unknown++;
          console.log(`Unknown unit example: "${unit}" in artwork ${art.id}`);
        }
      }
    }
  });

  console.log("=== AUDIT RESULTS ===");
  console.log(JSON.stringify(stats, null, 2));
}

audit();
