import { WardData, RecommendationItem } from '../types';

export function getWardRecommendations(ward: WardData): RecommendationItem[] {
  const recs: RecommendationItem[] = [];

  // 1. Low vegetation / canopy deficit
  if (ward.ndvi < 0.22) {
    recs.push({
      id: 'REC-VEG-01',
      domain: 'VEGETATION & GREEN INFRASTRUCTURE',
      trigger: `Low Vegetation Cover (NDVI ${ward.ndvi})`,
      title_en: 'Plant Miyawaki Micro-Forests & Street Canopies',
      title_te: 'మియావాకి చిట్టడవులు మరియు వీధి నీడ చెట్ల పెంపకం',
      action_en: 'Plant Miyawaki urban micro-forests and tree canopies in dense residential clusters, road medians, and school yards to lower local surface temperatures by up to 2.0°C–3.5°C.',
      action_te: 'రోడ్ల డివైడర్లు, పాఠశాలలు మరియు ఖాళీ స్థలాల్లో మైక్రో చిట్టడవులు పెంచి, పరిసర ఉష్ణోగ్రతను 2.0°C–3.5°C తగ్గించాలి.',
      priority: 'HIGH',
      feasibility_months: 4,
      responsible_agency: 'Municipal Urban Biodiversity Wing'
    });
  }

  // 2. High Land Surface Temperature (LST)
  if (ward.lst_celsius >= 40.0) {
    recs.push({
      id: 'REC-COOL-02',
      domain: 'COOL SURFACES & REFLECTIVE ROOFS',
      trigger: `High Surface Temperature (${ward.lst_celsius}°C)`,
      title_en: 'Paint Rooftops White with Cool Roof Coating',
      title_te: 'ఇళ్ల పైకప్పులకు తెల్లని కూల్ రూఫ్ రంగులు వేయడం',
      action_en: 'Paint rooftops white in low-income neighborhoods and residential clusters using solar reflective paint to cut indoor heat retention and lower room temperatures by 3°C–5°C.',
      action_te: 'రేకుల ఇళ్లు మరియు భవనాల పైకప్పులపై సూర్యరశ్మిని ప్రతిబింబించే కూల్ రూఫ్ రంగులు వేయించి, గదుల లోపల ఉష్ణోగ్రతను 3°C–5°C తగ్గించాలి.',
      priority: 'HIGH',
      feasibility_months: 2,
      responsible_agency: 'Cool Roof Policy Directorate'
    });
  }

  // 3. Extended Distance to Urban Health Center (UHC)
  if (ward.uhc_distance_km > 1.3) {
    recs.push({
      id: 'REC-HLTH-03',
      domain: 'HEALTHCARE & EMERGENCY RELIEF',
      trigger: `Distance to Primary Health Center (${ward.uhc_distance_km} km)`,
      title_en: 'Set Up Mobile Health Vans & Air-Cooled Cooling Centers',
      title_te: 'మొబైల్ హెల్త్ వ్యాన్లు మరియు పబ్లిక్ కూలింగ్ కేంద్రాలు',
      action_en: 'Convert community centers and bus stations into air-cooled cooling shelters equipped with drinking water, ORS hydration packets, and first-aid teams during peak afternoon hours (12 PM – 4:30 PM).',
      action_te: 'కమ్యూనిటీ హాళ్లు మరియు బస్టాండ్లను మధ్యాహ్నం 12 నుండి సాయంత్రం 4:30 వరకు చల్లని ఉపశమన కేంద్రాలుగా మార్చి, ORS మరియు ప్రథమ చికిత్స అందించాలి.',
      priority: ward.uhc_distance_km > 2.0 ? 'HIGH' : 'MEDIUM',
      feasibility_months: 1,
      responsible_agency: 'District Health & Family Welfare Office'
    });
  }

  // 4. Dense outdoor workforce (street vendors, construction, gig workers)
  if (ward.outdoor_workers_count > 2200) {
    recs.push({
      id: 'REC-WRK-04',
      domain: 'LABOR PROTECTION & HYDRATION',
      trigger: `High Outdoor Worker Density (${ward.outdoor_workers_count.toLocaleString()} workers)`,
      title_en: 'Set Up Shade Shelters & Free Water Kiosks for Outdoor Workers',
      title_te: 'నీడ విశ్రాంతి స్థలాలు మరియు ఉచిత మంచినీటి కేంద్రాలు',
      action_en: 'Set up shaded rest booths and free drinking water kiosks at busy markets and traffic junctions, and mandate afternoon rest breaks (12 PM – 3 PM) for outdoor workers.',
      action_te: 'మధ్యాహ్నం 12 నుండి 3 గంటల వరకు బహిరంగ పనులను నిలిపివేసి, ప్రధాన కూడళ్లలో ఉచిత మంచినీటి చలివేంద్రాలు మరియు ORS పంపిణీ కేంద్రాలను ఏర్పాటు చేయాలి.',
      priority: 'HIGH',
      feasibility_months: 1,
      responsible_agency: 'Department of Labor & City Administration'
    });
  }

  // 5. Dense low-income settlements / slums
  if (ward.low_income_slum_pct > 25.0) {
    recs.push({
      id: 'REC-SLUM-05',
      domain: 'VULNERABLE SETTLEMENT RETROFIT',
      trigger: `Slum Settlement Population (${ward.low_income_slum_pct}%)`,
      title_en: 'Install Shading Nets & Conduct Door-to-Door Health Checks',
      title_te: 'సహజ ఆకుపచ్చ నీడ నెట్లు మరియు ఇంటింటికీ ఆరోగ్య తనిఖీలు',
      action_en: 'Install green agro-shade nets over narrow lanes and send community health workers door-to-door to check on elderly residents, pregnant mothers, and young children.',
      action_te: 'ఇరుకైన బస్తీ సందులలో ఆకుపచ్చ నీడ నెట్లను అమర్చాలి మరియు వృద్ధులు, గర్భిణీలు, చిన్న పిల్లల ఆరోగ్య రక్షణ కోసం ఇంటింటికీ వెళ్లి అవగాహన కల్పించాలి.',
      priority: 'MEDIUM',
      feasibility_months: 3,
      responsible_agency: 'Municipal Urban Poverty Alleviation Wing'
    });
  }

  return recs;
}
