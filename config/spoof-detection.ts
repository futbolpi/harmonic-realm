export const COUNTRY_IP_GEO_SLACK_KM: Record<string, number> = {
  // Very high mobile/regional IP inaccuracy
  IN: 80, // India – often pinned to Mumbai/Delhi even in rural areas
  ID: 70, // Indonesia – huge spread across islands
  BR: 65, // Brazil – regional hubs dominate
  NG: 70, // Nigeria
  PK: 65, // Pakistan
  BD: 60, // Bangladesh
  MX: 60, // Mexico – carrier IPs often in Mexico City
  PH: 60, // Philippines
  EG: 60, // Egypt
  VN: 55, // Vietnam

  // High inaccuracy
  AR: 55, // Argentina
  CO: 55, // Colombia
  TH: 55, // Thailand
  MY: 50, // Malaysia
  ZA: 50, // South Africa
  KE: 50, // Kenya
  PE: 50, // Peru
  CL: 50, // Chile

  // Moderate (mostly urban centers off by 20–40 km)
  TR: 45, // Turkey
  UA: 45, // Ukraine
  RU: 45, // Russia (varies wildly by region)
  SA: 45, // Saudi Arabia
  MA: 40, // Morocco
  DZ: 40, // Algeria

  // Low – only slight slack needed
  US: 25,
  CA: 25,
  AU: 30,
  GB: 20,
  DE: 20,
  FR: 20,
  JP: 20,
  KR: 20,
  SG: 15,
  NL: 15,
  SE: 20,
  // Most of Western/Northern Europe, East Asia city-states: 15–25 km is plenty
};

// Default base threshold
export const BASE_MAX_DISTANCE_KM = 1000;
