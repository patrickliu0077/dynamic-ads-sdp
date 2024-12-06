# DynamicAds Node.js SDK

Node.js SDK for DynamicAds - Generate engaging ads with AI.

## Installation

```bash
npm install dynamic-ads-sdk
```

## Usage

```typescript
import DynamicAdsClient from 'dynamic-ads-sdk';

// Initialize the client
const dynamicAds = new DynamicAdsClient({
  apiKey: process.env.DYNAMICADS_API_KEY,
  baseUrl: 'http://localhost:4567/api/frontend' // Optional
});

// Example 1: Generate an ad and wait for completion
async function generateAd() {
  const ad = await dynamicAds.generateAndWait({
    prompt: 'Create a dynamic product showcase for TechGear Pro headphones',
    mediaType: 'video',
    dimensions: {
      width: 672,
      height: 384
    }
  });
  
  console.log('Generated ad:', ad);
  console.log('Media URL:', ad.mediaUrl);
  console.log('Voice URL:', ad.voiceUrl);
}

// Example 2: Generate multiple ad sizes in batch
async function generateAdBatch(productId: string) {
  const AD_SIZES = [
    { width: 300, height: 250 },
    { width: 728, height: 90 },
    { width: 160, height: 600 }
  ];

  const promises = AD_SIZES.map(dimensions => 
    dynamicAds.generateAndWait({
      prompt: `Create an ad for product ${productId}`,
      mediaType: 'video',
      dimensions
    })
  );

  const ads = await Promise.all(promises);
  console.log('Generated ads:', ads);
}

// Example 3: List previous ads
async function listPreviousAds() {
  const { ads, pagination } = await dynamicAds.listAds(1, 10);
  console.log('Previous ads:', ads);
  console.log('Pagination:', pagination);
}
```

## API Reference

### Configuration

The `DynamicAdsClient` constructor accepts the following options:

```typescript
interface DynamicAdsConfig {
  apiKey: string;              // Required: Your DynamicAds API key
  baseUrl?: string;            // Optional: API base URL (default: http://localhost:4567/api/frontend)
  maxPollingAttempts?: number; // Optional: Maximum attempts when polling for completion (default: 60)
  pollingInterval?: number;    // Optional: Interval between polling attempts in ms (default: 2000)
}
```

### Methods

#### generate(request: GenerateAdRequest): Promise<GenerateAdResponse>
Generate a new ad. Returns immediately with the ad ID.

```typescript
interface GenerateAdRequest {
  prompt: string;
  mediaType: 'video' | 'gif';
  dimensions: {
    width: number;
    height: number;
  };
}
```

#### getAd(id: string): Promise<Ad>
Get the current status and details of an ad.

#### waitForCompletion(id: string): Promise<Ad>
Poll until an ad completes generation or fails.

#### generateAndWait(request: GenerateAdRequest): Promise<Ad>
Generate an ad and wait for it to complete. Combines `generate` and `waitForCompletion`.

#### listAds(page?: number, limit?: number): Promise<ListAdsResponse>
List previously generated ads with pagination.

```typescript
interface ListAdsResponse {
  ads: Ad[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
```

### Types

#### Ad
```typescript
interface Ad {
  id: string;
  status: 'processing' | 'complete' | 'failed';
  prompt: string;
  mediaUrl?: string;
  voiceUrl?: string;
  componentCode?: string;
  dimensions: {
    width: number;
    height: number;
  };
  error?: string;
  createdAt?: string;
}
```

## Error Handling

The SDK throws errors in the following cases:
- Invalid API key or authentication failure
- Network errors
- Ad generation failure
- Timeout waiting for ad completion

Example error handling:

```typescript
try {
  const ad = await dynamicAds.generateAndWait({
    prompt: 'Create an ad',
    mediaType: 'video',
    dimensions: { width: 672, height: 384 }
  });
} catch (error) {
  if (error.response) {
    // API error response
    console.error('API Error:', error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

## License

MIT
