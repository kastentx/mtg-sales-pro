import { AllPrintingsFile } from '../types';

const MTGJSON_BASE_URL = 'https://mtgjson.com/api/v5';

export const MTGJSON_ENDPOINTS = {
  allPrintings: `${MTGJSON_BASE_URL}/AllPrintings.json.zip`,
  meta: `${MTGJSON_BASE_URL}/Meta.json.zip`,
} as const;

export async function fetchMTGJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch MTGJSON data: ${response.statusText}`);
  }
  return response.json();
}

export async function downloadAllPrintings(): Promise<AllPrintingsFile> {
  return fetchMTGJSON<AllPrintingsFile>(MTGJSON_ENDPOINTS.allPrintings);
}
