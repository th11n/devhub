export interface Metadata {
    title: string;
    description: string;
    image: string | null;
  }
  
  export async function scrapeMetadata(url: string): Promise<Metadata | null> {
    try {
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });
  
      if (!res.ok) {
        console.warn(`❌ Microlink API failed: ${res.status}`);
        return null;
      }
  
      const json = await res.json();
  
      if (json.status !== 'success') {
        console.warn(`❌ Microlink response not successful:`, json.status);
        return null;
      }
  
      const { title, description, image } = json.data;
  
      return {
        title: title || url,
        description: description || '',
        image: image?.url || getFaviconFallback(url),
      };
    } catch (err: any) {
      console.warn(`❌ Failed to fetch metadata via Microlink:`, err.message);
      return null;
    }
  }
  
  function getFaviconFallback(url: string): string | null {
    try {
      const u = new URL(url);
      return `${u.origin}/favicon.ico`;
    } catch {
      return null;
    }
  }
  