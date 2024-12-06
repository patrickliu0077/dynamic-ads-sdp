import DynamicAdsClient from '../src';

// Simple in-memory cache for demonstration
const cache = new Map<string, any>();

async function main() {
  // Initialize the client
  const dynamicAds = new DynamicAdsClient({
    apiKey: 'your-api-key', // Replace with your actual API key
    baseUrl: 'http://localhost:4567/api/frontend'
  });

  // Example function to serve an ad with caching
  async function serveAd(productId: string, width: number, height: number) {
    const cacheKey = `ad:${productId}:${width}x${height}`;
    
    // Try to get from cache first
    const cachedAd = cache.get(cacheKey);
    if (cachedAd) {
      console.log('Serving ad from cache');
      return cachedAd;
    }
    
    console.log('Generating new ad...');
    
    try {
      // Generate and wait for completion
      const ad = await dynamicAds.generateAndWait({
        prompt: `Create a dynamic ad for product ${productId}`,
        mediaType: 'video',
        dimensions: { width, height }
      });
      
      // Cache the result for 24 hours
      cache.set(cacheKey, ad);
      setTimeout(() => cache.delete(cacheKey), 24 * 60 * 60 * 1000);
      
      console.log('Ad generated successfully');
      return ad;
    } catch (error) {
      console.error('Error generating ad:', error.message);
      throw error;
    }
  }

  // Example usage
  try {
    // First request - generates new ad
    const ad1 = await serveAd('tech-headphones', 672, 384);
    console.log('First request:', {
      id: ad1.id,
      status: ad1.status,
      mediaUrl: ad1.mediaUrl
    });

    // Second request - serves from cache
    const ad2 = await serveAd('tech-headphones', 672, 384);
    console.log('Second request (cached):', {
      id: ad2.id,
      status: ad2.status,
      mediaUrl: ad2.mediaUrl
    });

    // Different size - generates new ad
    const ad3 = await serveAd('tech-headphones', 300, 250);
    console.log('Third request (different size):', {
      id: ad3.id,
      status: ad3.status,
      mediaUrl: ad3.mediaUrl
    });

  } catch (error) {
    console.error('Example failed:', error.message);
  }
}

main().catch(console.error);
