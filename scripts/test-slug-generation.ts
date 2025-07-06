import { generateSlug, generateUniqueSlug } from '../src/lib/utils';

// Test cases for slug generation
const testCases = [
  "Sunset Mountain",
  "Abstract Harmony #1",
  "Urban Dreams!",
  "Nature's Whisper",
  "Digital Waves",
  "The Great Wall",
  "Mona Lisa",
  "Starry Night",
  "The Scream",
  "Girl with a Pearl Earring",
  "The Persistence of Memory",
  "American Gothic",
  "The Birth of Venus",
  "The Last Supper",
  "Guernica",
  "The Night Watch",
  "The Kiss",
  "Water Lilies",
  "The Thinker",
  "David"
];

console.log('🧪 Testing slug generation functions...\n');

// Test basic slug generation
console.log('📝 Testing basic slug generation:');
testCases.forEach(title => {
  const slug = generateSlug(title);
  console.log(`  "${title}" → "${slug}"`);
});

console.log('\n🔄 Testing unique slug generation:');
const existingSlugs: string[] = [];

testCases.forEach(title => {
  const uniqueSlug = generateUniqueSlug(title, existingSlugs);
  existingSlugs.push(uniqueSlug);
  console.log(`  "${title}" → "${uniqueSlug}"`);
});

// Test duplicate handling
console.log('\n🔄 Testing duplicate handling:');
const duplicateTest = "Sunset Mountain";
const uniqueSlug1 = generateUniqueSlug(duplicateTest, existingSlugs);
const uniqueSlug2 = generateUniqueSlug(duplicateTest, [...existingSlugs, uniqueSlug1]);
console.log(`  First "${duplicateTest}" → "${uniqueSlug1}"`);
console.log(`  Second "${duplicateTest}" → "${uniqueSlug2}"`);

console.log('\n✅ Slug generation tests completed!'); 