import { TourPackage, MOCK_TOURS } from './mockData';

/**
 * Duplicate Prevention Guard:
 * Validates that no single image asset is reused across different tour packages.
 * Guarantees that each tour package maintains its own distinct set of authentic photos.
 */
export function validateTourImageUniqueness(tours: TourPackage[] = MOCK_TOURS): boolean {
  const seenUrls = new Map<string, string>();
  let hasDuplicate = false;

  for (const tour of tours) {
    const packageImages = new Set([tour.featuredImage, ...(tour.gallery || [])]);
    for (const imgUrl of packageImages) {
      if (seenUrls.has(imgUrl) && seenUrls.get(imgUrl) !== tour.id) {
        console.warn(`[Duplicate Prevention Alert] Image ${imgUrl} is shared between ${seenUrls.get(imgUrl)} and ${tour.id}`);
        hasDuplicate = true;
      } else {
        seenUrls.set(imgUrl, tour.id);
      }
    }
  }

  return !hasDuplicate;
}
