/**
 * Standard list of all 28 States and 8 Union Territories in India for GST and billing compliance
 */
const INDIAN_STATES = [
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const NORMALIZED_STATES_MAP = new Map(
  INDIAN_STATES.map(s => [s.toLowerCase().replace(/[^a-z0-9]/g, ''), s])
);

/**
 * Validates and normalizes an Indian state name.
 * Returns the canonical state string if valid, or null if invalid.
 */
function normalizeIndianState(input) {
  if (!input || typeof input !== 'string') return null;
  const key = input.toLowerCase().replace(/[^a-z0-9]/g, '');
  return NORMALIZED_STATES_MAP.get(key) || null;
}

module.exports = {
  INDIAN_STATES,
  normalizeIndianState
};
