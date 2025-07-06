import { extractRelativePath } from '../src/lib/utils';

// Test cases for image path extraction
const testCases = [
  // Full Supabase storage URLs
  {
    input: "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/image.jpg",
    expected: "image.jpg",
    description: "Full Supabase public URL"
  },
  {
    input: "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign/artworks/folder/image.png",
    expected: "folder/image.png",
    description: "Full Supabase signed URL with folder"
  },
  {
    input: "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/InShot_20230910_064904310.jpg",
    expected: "InShot_20230910_064904310.jpg",
    description: "Full Supabase URL with complex filename"
  },
  
  // Relative paths
  {
    input: "artworks/image.jpg",
    expected: "image.jpg",
    description: "Relative path with bucket prefix"
  },
  {
    input: "/artworks/image.jpg",
    expected: "image.jpg",
    description: "Relative path with leading slash and bucket prefix"
  },
  {
    input: "image.jpg",
    expected: "image.jpg",
    description: "Simple filename"
  },
  {
    input: "/image.jpg",
    expected: "image.jpg",
    description: "Simple filename with leading slash"
  },
  {
    input: "folder/image.jpg",
    expected: "folder/image.jpg",
    description: "Relative path with folder"
  },
  {
    input: "/folder/image.jpg",
    expected: "folder/image.jpg",
    description: "Relative path with folder and leading slash"
  },
  
  // Edge cases
  {
    input: "",
    expected: "",
    description: "Empty string"
  },
  {
    input: "https://example.com/image.jpg",
    expected: "image.jpg",
    description: "Non-Supabase URL"
  },
  {
    input: "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/other-bucket/image.jpg",
    expected: "image.jpg",
    description: "Supabase URL with different bucket"
  }
];

console.log("🧪 Testing image path extraction...\n");

let passedTests = 0;
const totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const result = extractRelativePath(testCase.input);
  const passed = result === testCase.expected;
  
  if (passed) {
    passedTests++;
    console.log(`✅ Test ${index + 1}: ${testCase.description}`);
  } else {
    console.log(`❌ Test ${index + 1}: ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got: "${result}"`);
  }
});

console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 All tests passed! Image path extraction is working correctly.");
} else {
  console.log("⚠️  Some tests failed. Please review the image path extraction logic.");
  process.exit(1);
} 