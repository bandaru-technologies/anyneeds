// Maps common alternate spellings / old names → canonical DB city name
const ALIASES = {
  'bengaluru': 'Bangalore',
  'bengalore': 'Bangalore',
  'bangaluru': 'Bangalore',
  'blr': 'Bangalore',
  'bombay': 'Mumbai',
  'madras': 'Chennai',
  'calcutta': 'Kolkata',
  'new delhi': 'Delhi',
  'ncr': 'Delhi',
  'gurgaon': 'Gurugram',
  'gurugram': 'Gurugram',
  'noida': 'Noida',
  'greater noida': 'Noida',
};

export function normalizeCity(city) {
  if (!city) return city;
  return ALIASES[city.trim().toLowerCase()] || city.trim();
}
