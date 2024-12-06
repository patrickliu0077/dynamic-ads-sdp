import DynamicAdsClient from '../src';

// Standard ad sizes
const AD_SIZES = [
  { width: 300, height: 250, name: 'Medium Rectangle' },
  { width: 728, height: 90, name: 'Leaderboard' },
  { width: 160, height: 600, name: 'Wide Skyscraper' },
  { width: 320, height: 50, name: 'Mobile Banner' },
  { width: 970, height: 250, name: 'Billboard' }
];

// Redis-like cache interface (simplified for example)
class Cache {
  private store = new Map<string, any>();

  async get(key: string) {
    return this.store.get(key);
  }

  async set(key: string, value: any, ttl: number) {
    this.store.set(key, value);
    setTimeout(() => this.store.delete(key), ttl * 1000);
  }

  async mget(keys: string[]) {
    return keys.map(key => this.store.get(key));
  }

  async mset(entries: [string, any][], ttl: number) {
    for (const [key, value] of entries) {
      await this.set(key, value, ttl);
    }
  }
}

async function main() {
  const cache = new Cache();
  
  const dynamicAds = new DynamicAdsClient({
    apiKey: 'your-api-key', // Replace with your actual API key
    baseUrl: 'http://localhost:4567/api/frontend'
  });

  async function generateAdBatch(productId: string, productName: string) {
    console.log(`Generating ad batch for ${productName}...`);

    // Generate cache keys for all sizes
    const cacheKeys = AD_SIZES.map(size => 
      `ad:${productId}:${size.width}x${size.height}`
    );

    // Check cache first
    const cachedAds = await cache.mget(cacheKeys);
    const missingIndices = cachedAds.map((ad, i) => ad ? -1 : i).filter(i => i !== -1);

    if (missingIndices.length === 0) {
      console.log('All sizes found in cache');
      return cachedAds;
    }

    // Generate missing sizes
    const sizesToGenerate = missingIndices.map(i => AD_SIZES[i]);
    console.log(`Generating ${sizesToGenerate.length} missing sizes...`);

    try {
      const generatedAds = await Promise.all(
        sizesToGenerate.map(size =>
          dynamicAds.generateAndWait({
            prompt: `Create a compelling ad for ${productName}. Size: ${size.name} (${size.width}x${size.height})`,
            mediaType: 'video',
            dimensions: {
              width: size.width,
              height: size.height
            }
          })
        )
      );

      // Cache new ads
      const newEntries: [string, any][] = missingIndices.map((originalIndex, i) => [
        cacheKeys[originalIndex],
        generatedAds[i]
      ]);
      await cache.mset(newEntries, 24 * 60 * 60); // 24 hours TTL

      // Merge cached and new ads
      const result = [...cachedAds];
      missingIndices.forEach((originalIndex, i) => {
        result[originalIndex] = generatedAds[i];
      });

      return result;
    } catch (error) {
      console.error('Error generating ads:', error.message);
      throw error;
    }
  }

  // Example usage
  try {
    // First batch - generates all sizes
    console.log('\n=== First Batch ===');
    const batch1 = await generateAdBatch('tech-1', 'TechGear Pro Headphones');
    console.log('Generated ads:', batch1.map(ad => ({
      id: ad.id,
      dimensions: ad.dimensions,
      status: ad.status
    })));

    // Second batch for same product - serves from cache
    console.log('\n=== Second Batch (Same Product) ===');
    const batch2 = await generateAdBatch('tech-1', 'TechGear Pro Headphones');
    console.log('Cached ads:', batch2.map(ad => ({
      id: ad.id,
      dimensions: ad.dimensions,
      status: ad.status
    })));

    // Third batch for different product - generates new ads
    console.log('\n=== Third Batch (Different Product) ===');
    const batch3 = await generateAdBatch('tech-2', 'TechGear Wireless Earbuds');
    console.log('Generated ads:', batch3.map(ad => ({
      id: ad.id,
      dimensions: ad.dimensions,
      status: ad.status
    })));

  } catch (error) {
    console.error('Batch processing failed:', error.message);
  }
}

main().catch(console.error);
