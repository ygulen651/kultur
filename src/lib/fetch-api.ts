/**
 * Next.js App Router için production-ready fetch fonksiyonu
 * Development ve production ortamlarında otomatik çalışır
 */

// Development için relative URL kullan (otomatik port detection)
const DEV_BASE_URL = '';

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
  
  // Fallback - production'da localhost kullanma
  return '';
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
  const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
  
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
export async function fetchApiJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchApi(endpoint, options);
  return response.json();
}

/**
 * Generic CRUD operations
 */
export const api = {
  // GET
  get: <T>(endpoint: string): Promise<T> => fetchApiJson<T>(endpoint),
  
  // POST
  post: <T>(endpoint: string, data: unknown): Promise<T> => 
    fetchApiJson<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  // PUT
  put: <T>(endpoint: string, data: unknown): Promise<T> => 
    fetchApiJson<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  // PATCH
  patch: <T>(endpoint: string, data: unknown): Promise<T> => 
    fetchApiJson<T>(endpoint, { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
  
  // DELETE
  delete: <T>(endpoint: string): Promise<T> => 
    fetchApiJson<T>(endpoint, { method: 'DELETE' }),
};
