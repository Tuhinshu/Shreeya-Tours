import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockDataPath = path.resolve(__dirname, '../src/utils/mockData.ts');
const publicToursPath = path.resolve(__dirname, '../public/tours');

const content = fs.readFileSync(mockDataPath, 'utf-8');

// Parse tour packages from mockData.ts
const tourBlocks = content.split(/id:\s*'/).slice(1);
const seenUrls = new Map();
let duplicateCount = 0;
let missingFiles = 0;

console.log(`🔍 Validating tour image uniqueness and disk presence across ${tourBlocks.length} packages...`);

for (const block of tourBlocks) {
  const tourId = block.split("'")[0];
  const featuredMatch = block.match(/featuredImage:\s*'([^']+)'/);
  const featuredImage = featuredMatch ? featuredMatch[1] : null;

  // Extract gallery array
  const galleryPart = block.split('itinerary:')[0];
  const galleryMatches = [...galleryPart.matchAll(/'(\/tours\/[^']+)'/g)].map(m => m[1]);

  const packageImages = new Set([featuredImage, ...galleryMatches].filter(Boolean));

  for (const imgUrl of packageImages) {
    // Check uniqueness across packages
    if (seenUrls.has(imgUrl) && seenUrls.get(imgUrl) !== tourId) {
      console.error(`❌ [Duplicate Image] ${imgUrl} is used in both "${seenUrls.get(imgUrl)}" and "${tourId}"`);
      duplicateCount++;
    } else {
      seenUrls.set(imgUrl, tourId);
    }

    // Check disk presence for local files
    if (imgUrl.startsWith('/tours/')) {
      const localFile = path.join(publicToursPath, imgUrl.replace('/tours/', ''));
      if (!fs.existsSync(localFile)) {
        console.error(`❌ [Missing Asset] Referenced file not found: ${localFile}`);
        missingFiles++;
      }
    }
  }
}

if (duplicateCount > 0 || missingFiles > 0) {
  console.error(`\n❌ Image validation failed with ${duplicateCount} duplicate(s) and ${missingFiles} missing asset(s).`);
  process.exit(1);
} else {
  console.log(`✅ Image validation passed: ${seenUrls.size} unique tour assets verified across ${tourBlocks.length} packages.`);
  process.exit(0);
}
