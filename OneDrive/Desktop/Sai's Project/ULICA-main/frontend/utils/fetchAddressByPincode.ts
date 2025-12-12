/**
 * Centralized utility for fetching address data by pincode
 * Uses dual-source approach: India Postal API (primary) + Zippopotam API (fallback)
 */

export interface AddressData {
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface IndiaPostalResponse {
  Status: string;
  PostOffice: Array<{
    District: string;
    State: string;
    Country: string;
  }>;
}

export interface ZippopotamResponse {
  country: string;
  places: Array<{
    'place name': string;
    state: string;
  }>;
}

/**
 * Fetches address data by pincode using dual-source approach
 * @param pincode - 6-digit Indian pincode
 * @returns Promise<AddressData> - Normalized address data
 */
export async function fetchAddressByPincode(pincode: string): Promise<AddressData> {
  // Validate pincode format
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    throw new Error('Invalid pincode format. Please enter a 6-digit pincode.');
  }

  try {
    // Try India Postal API first (more accurate for Indian addresses)
    const addressData = await fetchFromIndiaPostalAPI(pincode);
    return addressData;
  } catch (error) {

    try {
      // Fallback to Zippopotam API
      const addressData = await fetchFromZippopotamAPI(pincode);
      return addressData;
    } catch (fallbackError) {
      
      throw new Error('Unable to fetch address data. Please check the pincode and try again.');
    }
  }
}

/**
 * Fetches address data from India Postal API
 * @param pincode - 6-digit Indian pincode
 * @returns Promise<AddressData> - Normalized address data
 */
async function fetchFromIndiaPostalAPI(pincode: string): Promise<AddressData> {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`India Postal API request failed: ${response.status}`);
  }

  const data: IndiaPostalResponse[] = await response.json();
  
  if (!data || data.length === 0 || data[0].Status !== 'Success') {
    throw new Error('Invalid pincode or not found in India Postal API');
  }

  const postOffice = data[0].PostOffice[0];
  if (!postOffice) {
    throw new Error('No post office data found for this pincode');
  }

  return {
    city: postOffice.District || '',
    state: postOffice.State || '',
    country: 'India',
    pincode: pincode,
  };
}

/**
 * Fetches address data from Zippopotam API (fallback)
 * @param pincode - 6-digit Indian pincode
 * @returns Promise<AddressData> - Normalized address data
 */
async function fetchFromZippopotamAPI(pincode: string): Promise<AddressData> {
  const response = await fetch(`https://api.zippopotam.us/in/${pincode}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Zippopotam API request failed: ${response.status}`);
  }

  const data: ZippopotamResponse = await response.json();
  
  if (!data.places || data.places.length === 0) {
    throw new Error('Invalid pincode or not found in Zippopotam API');
  }

  const place = data.places[0];
  return {
    city: place['place name'] || '',
    state: place.state || '',
    country: data.country || 'India',
    pincode: pincode,
  };
}

/**
 * Validates if a pincode is in correct format
 * @param pincode - Pincode to validate
 * @returns boolean - True if valid format
 */
export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

/**
 * Normalizes pincode by removing spaces and ensuring 6 digits
 * @param pincode - Raw pincode input
 * @returns string - Normalized pincode
 */
export function normalizePincode(pincode: string): string {
  return pincode.replace(/\s/g, '').slice(0, 6);
}
