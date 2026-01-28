// US State Sales Tax Rates (2024)
// These are general state-level rates. Some states have local taxes that add to these.
// Note: Some states have no sales tax (0%)

export const US_STATE_TAX_RATES: Record<string, number> = {
  'AL': 0.04,     // Alabama
  'AK': 0.00,     // Alaska (no state sales tax)
  'AZ': 0.056,    // Arizona
  'AR': 0.065,    // Arkansas
  'CA': 0.0725,   // California
  'CO': 0.029,    // Colorado
  'CT': 0.0635,   // Connecticut
  'DE': 0.00,     // Delaware (no sales tax)
  'FL': 0.06,     // Florida
  'GA': 0.04,     // Georgia
  'HI': 0.04,     // Hawaii
  'ID': 0.06,     // Idaho
  'IL': 0.0625,   // Illinois
  'IN': 0.07,     // Indiana
  'IA': 0.06,     // Iowa
  'KS': 0.065,    // Kansas
  'KY': 0.06,     // Kentucky
  'LA': 0.0445,   // Louisiana
  'ME': 0.055,    // Maine
  'MD': 0.06,     // Maryland
  'MA': 0.0625,   // Massachusetts
  'MI': 0.06,     // Michigan
  'MN': 0.06875,  // Minnesota
  'MS': 0.07,     // Mississippi
  'MO': 0.04225,  // Missouri
  'MT': 0.00,     // Montana (no sales tax)
  'NE': 0.055,    // Nebraska
  'NV': 0.0685,   // Nevada
  'NH': 0.00,     // New Hampshire (no sales tax)
  'NJ': 0.06625,  // New Jersey
  'NM': 0.05125,  // New Mexico
  'NY': 0.04,     // New York
  'NC': 0.0475,   // North Carolina
  'ND': 0.05,     // North Dakota
  'OH': 0.0575,   // Ohio
  'OK': 0.045,    // Oklahoma
  'OR': 0.00,     // Oregon (no sales tax)
  'PA': 0.06,     // Pennsylvania
  'RI': 0.07,     // Rhode Island
  'SC': 0.06,     // South Carolina
  'SD': 0.045,    // South Dakota
  'TN': 0.07,     // Tennessee
  'TX': 0.0625,   // Texas
  'UT': 0.061,    // Utah
  'VT': 0.06,     // Vermont
  'VA': 0.053,    // Virginia
  'WA': 0.065,    // Washington
  'WV': 0.06,     // West Virginia
  'WI': 0.05,     // Wisconsin
  'WY': 0.04,     // Wyoming
  'DC': 0.06,     // Washington D.C.
};

// US State names for display
export const US_STATES: Record<string, string> = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'Washington D.C.',
};

// Calculate tax amount based on state and subtotal
export function calculateTax(stateCode: string, subtotal: number): number {
  const rate = US_STATE_TAX_RATES[stateCode.toUpperCase()] ?? 0;
  return Math.round(subtotal * rate * 100) / 100; // Round to 2 decimal places
}

// Get tax rate for a state (as percentage)
export function getTaxRate(stateCode: string): number {
  return US_STATE_TAX_RATES[stateCode.toUpperCase()] ?? 0;
}

// Get tax rate display string
export function getTaxRateDisplay(stateCode: string): string {
  const rate = getTaxRate(stateCode);
  if (rate === 0) return 'No tax';
  return `${(rate * 100).toFixed(2)}%`;
}
