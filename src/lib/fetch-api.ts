/**
 * Next.js App Router için production-ready fetch fonksiyonu
 * Development ve production ortamlarında otomatik çalışır
 */

// Development için sabit URL
const DEV_BASE_URL = 'http://localhost:3000';

// Production için environment variable'dan al
const PROD_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;

/**
 * Base URL'i otomatik olarak belirler
 */
function getBaseUrl(): string {
  // Development ortamında
  if (process.env.NODE_ENV === 'development') {
    return DEV_BASE_URL;
  }
  
  // Production ortamında
  if (PROD_BASE_URL) {
    // Vercel'de https:// kullan
    return PROD_BASE_URL.startsWith('http') ? PROD_BASE_URL : `https://${PROD_BASE_URL}`;
  }
  
  // Fallback
  return 'https://localhost:3000';
}

/**
 * API endpoint'lerini fetch eder
 * @param endpoint - API endpoint (örn: '/api/events')
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  // Default options
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}

/**
 * JSON response'ları fetch eder
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Promise<T>
 */
export async function fetchApiJson<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchApi(endpoint, options);
  return response.json();
}

/**
 * GET request için kısayol
 */
export async function getApi<T = any>(endpoint: string): Promise<T> {
  return fetchApiJson<T>(endpoint, { method: 'GET' });
}

/**
 * POST request için kısayol
 */
export async function postApi<T = any>(
  endpoint: string,
  data: any
): Promise<T> {
  return fetchApiJson<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request için kısayol
 */
export async function putApi<T = any>(
  endpoint: string,
  data: any
): Promise<T> {
  return fetchApiJson<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request için kısayol
 */
export async function deleteApi<T = any>(endpoint: string): Promise<T> {
  return fetchApiJson<T>(endpoint, { method: 'DELETE' });
}
