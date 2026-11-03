import { Language } from '../types';

export const TRANSLATIONS = {
  en: {
    // App Header & Branding
    appName: 'Geospatial Urban Heat Risk Intelligent System',
    appSubtitle: 'Ward-Level Geospatial AI Intelligent Platform',
    liveTelemetry: 'Live Telemetry Active',
    viewRolePlanner: 'Urban Planner View',
    viewRoleCHW: 'General Public View',
    languageSelector: 'Language',
    searchPlaceholder: 'Search by PIN Code, Ward Name, or Landmark...',
    exportPlan: 'Export Action Plan',

    // Navigation Tabs
    navOverview: 'Dashboard',
    navHeatMap: 'Interactive Map',
    navWardProfile: 'Heat Indices',
    navScenarios: 'Scenario Analysis',
    navSocialVuln: 'Social Vulnerability',
    navComparison: 'Comparisons',
    navTrends: 'Trends & Analytics',
    navRecommendations: 'Recommendations',
    navAlerts: 'Alerts & Notifications',
    navMethodology: 'Methodology & Tech Stack',
    reportsTitle: 'Reports',

    // Status & KPI Cards
    totalWardsMonitored: 'Total Wards Monitored',
    highRiskWards: 'High Risk Wards (HVI 7-10)',
    moderateRiskWards: 'Moderate Risk (HVI 4-6)',
    lowRiskWards: 'Low Risk (HVI 1-3)',
    cityMeanLST: 'City-Wide Mean LST',
    activeAlertsCount: 'Critical Heat Alerts',

    // Indicators
    hviScore: 'Heat Vulnerability Index (HVI)',
    exposureDomain: 'Exposure Domain',
    sensitivityDomain: 'Sensitivity Domain',
    adaptiveCapacityDomain: 'Adaptive Capacity Domain',
    lstIndicator: 'Land Surface Temperature (LST)',
    ndviIndicator: 'Vegetation Canopy (NDVI)',
    ndwiIndicator: 'Water Bodies Index (NDWI)',
    popDensity: 'Population Density',
    buildingDensity: 'Built-up Surface Density',
    uhcProximity: 'Nearest Urban Health Center',
    weatherTemp: 'Current Ambient Temp',
    weatherHumidity: 'Relative Humidity',
    heatIndex: 'Heat Index (Feels Like)',

    // Actions & Buttons
    downloadPdf: 'Download PDF Report',
    selectWard: 'Select Ward',
    simulateScenarioBtn: 'Run Scenario Simulation',
    resetScenario: 'Reset Parameters',
    compareWardsBtn: 'Compare Wards',
    viewProfileBtn: 'View Complete Ward Profile',
    applyFilters: 'Apply Map Filters',
    viewTrendBtn: 'View Trend',
    viewRecsBtn: 'View Recommendations',
    viewDetails: 'View Details',
    hideDetails: 'Hide Details',
    close: 'Close',
    noData: 'No data available for this selection.',

    // Risk Categories
    riskHigh: 'High Risk',
    riskModerate: 'Moderate Risk',
    riskLow: 'Low Risk',

    // Explainable AI & SHAP
    shapTitle: 'Explainable AI — SHAP Feature Driver Attribution',
    shapSubtitle: 'Mathematically grounded feature importance explaining why this ward has this heat risk score',
    positiveDrivers: 'Positive Risk Drivers (Elevates Risk)',
    negativeDrivers: 'Mitigating Protective Factors (Lowers Risk)',
    groundedNarrative: 'Factor-Grounded Plain Language Explanation',

    // Scenario Analysis
    scenarioTitle: 'What-If Scenario Simulation Engine',
    scenarioSubtitle: 'Model future environmental interventions and evaluate quantitative changes in Heat Vulnerability',
    paramGreenCover: 'Increase Green Canopy Cover (NDVI)',
    paramUrbanExpansion: 'Urban Concrete Expansion (Built-up)',
    paramCoolRoofs: 'Cool Roofs & High-Albedo Retrofit',
    currentBaseline: 'Current Baseline',
    simulatedFuture: 'Simulated Future',
    netDeltaChange: 'Net HVI Impact',

    // Ward Profile
    profHviBtn: 'HVI Overview',
    profDomainBtn: 'Three-Domain Assessment',
    profIndicatorsBtn: 'Vulnerability Indicators',
    profShapBtn: 'SHAP / Feature Explanation',

    // Social Vulnerability
    socialVulnTitle: 'Social & Demographic Heat Vulnerability Assessment',
    socialVulnSubtitle: 'Identification and protection planning for sensitive populations',
    elderlyGroup: 'Elderly Population',
    childrenGroup: 'Children (0–6)',
    femaleGroup: 'Female Population',
    workersGroup: 'Outdoor Workers',
    slumGroup: 'Low-Income Communities',
    healthGapGroup: 'Healthcare Accessibility',

    // Comparison & Trends
    compHviBtn: 'HVI Comparison',
    compLstBtn: 'LST Comparison',
    compNdviBtn: 'Tree Canopy / NDVI',
    compPopBtn: 'Population Density',
    compHealthBtn: 'Health Infrastructure Gap',

    trendLstBtn: 'LST Trend',
    trendNdviBtn: 'NDVI Trend',
    trendBuiltupBtn: 'Built-Up Expansion',
    trendPopBtn: 'Population Pressure',

    // General Public View
    chwTitle: 'General Public Advisory & Action Dashboard',
    chwSubtitle: 'Clear heat risk advisories, practical precautions, emergency contacts, local temperatures, and cooling center locations.',
    symptomsToWatch: 'Heat Illness Symptoms to Monitor',
    emergencyContact: 'Emergency Medical Contacts',
    coolingCentresAvailable: 'Public Air-Cooled Respite Shelters',

    // Map Controls
    mapLayerHVI: 'Heat Vulnerability Index (HVI)',
    mapLayerLST: 'Thermal Radiation (LST °C)',
    mapLayerNDVI: 'Vegetation Canopy (NDVI)',
    mapLayerHealth: 'Health Centers (UHC)'
  },
  te: {
    // App Header & Branding
    appName: 'జియోస్పేషియల్ అర్బన్ హీట్ రిస్క్ ఇంటెలిజెంట్ సిస్టమ్',
    appSubtitle: 'వార్డు స్థాయి ఉష్ణ తీవ్రత మరియు ఉపశమన ఇంటెలిజెంట్ వ్యవస్థ',
    liveTelemetry: 'ప్రత్యక్ష వాతావరణ సమాచారం చురుకుగా ఉంది',
    viewRolePlanner: 'పట్టణ ప్రణాళికా నిపుణుల వీక్షణ',
    viewRoleCHW: 'ప్రజా వీక్షణ',
    languageSelector: 'భాష',
    searchPlaceholder: 'పిన్ కోడ్, వార్డు పేరు లేదా ల్యాండ్‌మార్క్ ద్వారా వెతకండి...',
    exportPlan: 'కార్యాచరణ ప్రణాళికను డౌన్‌లోడ్ చేయండి',

    // Navigation Tabs
    navOverview: 'డాష్‌బోర్డ్',
    navHeatMap: 'ఇంటరాక్టివ్ మ్యాప్',
    navWardProfile: 'వార్డు ప్రొఫైల్',
    navScenarios: 'సిమ్యులేషన్ విశ్లేషణ',
    navSocialVuln: 'సామాజిక ఉష్ణ ముప్పు',
    navComparison: 'పోలికలు (Comparisons)',
    navTrends: 'కాలక్రమ ధోరణులు',
    navRecommendations: 'ఉపశమన సూచనలు',
    navAlerts: 'హెచ్చరికలు',
    navMethodology: 'పరిశోధన పద్ధతి',
    reportsTitle: 'నివేదికలు',

    // Status & KPI Cards
    totalWardsMonitored: 'మొత్తం వార్డులు',
    highRiskWards: 'అత్యధిక ముప్పు వార్డులు (HVI 7-10)',
    moderateRiskWards: 'మధ్యస్థ ముప్పు (HVI 4-6)',
    lowRiskWards: 'తక్కువ ముప్పు (HVI 1-3)',
    cityMeanLST: 'నగర సగటు ఉపరితల ఉష్ణోగ్రత',
    activeAlertsCount: 'తీవ్ర ఉష్ణ హెచ్చరికలు',

    // Indicators
    hviScore: 'హీట్ వల్నరబిలిటీ ఇండెక్స్ (HVI)',
    exposureDomain: 'ఎక్స్‌పోజర్ స్కోర్',
    sensitivityDomain: 'సెన్సిటివిటీ స్కోర్',
    adaptiveCapacityDomain: 'అడాప్టివ్ కెపాసిటీ',
    lstIndicator: 'భూ ఉపరితల ఉష్ణోగ్రత (LST)',
    ndviIndicator: 'పచ్చదనం సూచిక (NDVI)',
    ndwiIndicator: 'జల వనరుల సూచిక (NDWI)',
    popDensity: 'జనసాంద్రత',
    buildingDensity: 'భవనాల సాంద్రత',
    uhcProximity: 'సమీప ఆరోగ్య కేంద్రం',
    weatherTemp: 'ప్రస్తుత ఉష్ణోగ్రత',
    weatherHumidity: 'గాలిలో తేమ',
    heatIndex: 'హీట్ ఇండెక్స్',

    // Actions & Buttons
    downloadPdf: 'PDF నివేదిక డౌన్‌లోడ్',
    selectWard: 'వార్డును ఎంచుకోండి',
    simulateScenarioBtn: 'సిమ్యులేషన్ చేయండి',
    resetScenario: 'మళ్లీ మొదటికి మార్చు',
    compareWardsBtn: 'వార్డులను పోల్చండి',
    viewProfileBtn: 'పూర్తి వార్డు వివరాలు చూడండి',
    applyFilters: 'మ్యాప్ ఫిల్టర్లు వర్తింపజేయి',
    viewTrendBtn: 'ట్రెండ్ చూడండి',
    viewRecsBtn: 'సిఫార్సులు చూడండి',
    viewDetails: 'వివరాలు చూడండి',
    hideDetails: 'వివరాలు దాచండి',
    close: 'మూసివేయి',
    noData: 'ఈ ఎంపికకు సంబంధించి సమాచారం అందుబాటులో లేదు.',

    // Risk Categories
    riskHigh: 'తీవ్ర ప్రమాదం',
    riskModerate: 'మధ్యస్థ ప్రమాదం',
    riskLow: 'తక్కువ ప్రమాదం',

    // Explainable AI & SHAP
    shapTitle: 'వివరణాత్మక AI (SHAP) — కారకాల విశ్లేషణ',
    shapSubtitle: 'ఉష్ణ ముప్పుకు గల నిర్దిష్ట కారకాల విశ్లేషణ',
    positiveDrivers: 'రిస్క్ పెంచే ప్రధాన కారకాలు',
    negativeDrivers: 'వేడిని తగ్గించే రక్షిత కారకాలు',
    groundedNarrative: 'సరళ భాషా వివరణ',

    // Scenario Analysis
    scenarioTitle: 'భవిష్యత్ దృశ్యాల సిమ్యులేషన్',
    scenarioSubtitle: 'చెట్ల పెంపకం లేదా కాంక్రీట్ విస్తరణ ప్రభావ అంచనా',
    paramGreenCover: 'పచ్చదనం పెంపు (NDVI)',
    paramUrbanExpansion: 'కాంక్రీట్ విస్తరణ (Built-up)',
    paramCoolRoofs: 'కూల్ రూఫ్ పూతలు',
    currentBaseline: 'ప్రస్తుత పరిస్థితి',
    simulatedFuture: 'సిమ్యులేటెడ్ భవిష్యత్తు',
    netDeltaChange: 'HVI మార్పు',

    // Ward Profile
    profHviBtn: 'HVI అవలోకనం',
    profDomainBtn: 'మూడు విభాగాభ్యాస అంచనా',
    profIndicatorsBtn: 'ముప్పు సూచికలు',
    profShapBtn: 'SHAP విశ్లేషణ వివరణ',

    // Social Vulnerability
    socialVulnTitle: 'సామాజిక మరియు జనాభా ఉష్ణ ముప్పు విశ్లేషణ',
    socialVulnSubtitle: 'సున్నిత ప్రజల రక్షణ ప్రణాళిక',
    elderlyGroup: 'వృద్ధుల జనాభా',
    childrenGroup: 'చిన్నపిల్లలు (0–6)',
    femaleGroup: 'మహిళా జనాభా',
    workersGroup: 'బహిరంగ కార్మికులు',
    slumGroup: 'తక్కువ ఆదాయ సముదాయాలు',
    healthGapGroup: 'ఆరోగ్య సంరక్షణ లభ్యత',

    // Comparison & Trends
    compHviBtn: 'HVI పోలిక',
    compLstBtn: 'LST ఉష్ణోగ్రత పోలిక',
    compNdviBtn: 'పచ్చదనం / NDVI పోలిక',
    compPopBtn: 'జనసాంద్రత పోలిక',
    compHealthBtn: 'ఆరోగ్య కేంద్రాల గ్యాప్',

    trendLstBtn: 'LST ట్రెండ్',
    trendNdviBtn: 'NDVI ట్రెండ్',
    trendBuiltupBtn: 'కాంక్రీట్ విస్తరణ',
    trendPopBtn: 'జనాభా ఒత్తిడి',

    // General Public View
    chwTitle: 'సాధారణ ప్రజల వేడి గాలుల సమాచారం',
    chwSubtitle: 'ఉష్ణోగ్రత, అవసరమైన జాగ్రత్తలు, అత్యవసర నంబర్లు మరియు చలివేంద్రాల వివరాలు.',
    symptomsToWatch: 'వడదెబ్బ లక్షణాలు',
    emergencyContact: 'అత్యవసర వైద్య పరిచయాలు',
    coolingCentresAvailable: 'ప్రభుత్వ కూలింగ్ రిలీఫ్ కేంద్రాలు',

    // Map Controls
    mapLayerHVI: 'హీట్ వల్నరబిలిటీ ఇండెక్స్ (HVI)',
    mapLayerLST: 'భూ ఉష్ణోగ్రత (LST °C)',
    mapLayerNDVI: 'పచ్చదనం సూచిక (NDVI)',
    mapLayerHealth: 'ఆరోగ్య కేంద్రాలు (UHC)'
  },
  hi: {
    // App Header & Branding
    appName: 'जियोस्पेशियल अर्बन हीट रिस्क इंटेलिजेंट सिस्टम',
    appSubtitle: 'वार्ड-स्तरीय जियोस्पेशियल एआई इंटेलिजेंट प्लेटफॉर्म',
    liveTelemetry: 'लाइव टेलीमेट्री सक्रिय',
    viewRolePlanner: 'शहरी नियोजक दृष्टिकोण',
    viewRoleCHW: 'आम जनता दृष्टिकोण',
    languageSelector: 'भाषा',
    searchPlaceholder: 'पिन कोड, वार्ड का नाम या लैंडमार्क खोजें...',
    exportPlan: 'कार्य योजना निर्यात करें',

    // Navigation Tabs
    navOverview: 'डैशबोर्ड',
    navHeatMap: 'इंटरैक्टिव मानचित्र',
    navWardProfile: 'वार्ड प्रोफ़ाइल',
    navScenarios: 'परिदृश्य विश्लेषण',
    navSocialVuln: 'सामाजिक संवेदनशीलता',
    navComparison: 'तुलना (Comparisons)',
    navTrends: 'रुझान और विश्लेषण',
    navRecommendations: 'शमन सिफारिशें',
    navAlerts: 'चेतावनी और सूचनाएं',
    navMethodology: 'कार्यप्रणाली',
    reportsTitle: 'रिपोर्ट्स',

    // Status & KPI Cards
    totalWardsMonitored: 'कुल मॉनिटर किए गए वार्ड',
    highRiskWards: 'उच्च जोखिम वाले वार्ड (HVI 7-10)',
    moderateRiskWards: 'मध्यम जोखिम (HVI 4-6)',
    lowRiskWards: 'कम जोखिम (HVI 1-3)',
    cityMeanLST: 'शहर का औसत सतह तापमान',
    activeAlertsCount: 'गंभीर गर्मी की चेतावनियां',

    // Indicators
    hviScore: 'हीट वल्नेरेबिलिटी इंडेक्स (HVI)',
    exposureDomain: 'एक्सपोजर क्षेत्र',
    sensitivityDomain: 'संवेदनशीलता क्षेत्र',
    adaptiveCapacityDomain: 'अनुकूलन क्षमता',
    lstIndicator: 'भूमि सतह तापमान (LST)',
    ndviIndicator: 'वनस्पति आवरण (NDVI)',
    ndwiIndicator: 'जल निकाय सूचकांक (NDWI)',
    popDensity: 'जनसंख्या घनत्व',
    buildingDensity: 'निर्मित सतह घनत्व',
    uhcProximity: 'निकटतम स्वास्थ्य केंद्र',
    weatherTemp: 'वर्तमान तापमान',
    weatherHumidity: 'सापेक्ष आर्द्रता',
    heatIndex: 'हीट इंडेक्स (महसूस होने वाली गर्मी)',

    // Actions & Buttons
    downloadPdf: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    selectWard: 'वार्ड चुनें',
    simulateScenarioBtn: 'सिमुलेशन चलाएं',
    resetScenario: 'पैरामीटर रीसेट करें',
    compareWardsBtn: 'वार्डों की तुलना करें',
    viewProfileBtn: 'संपूर्ण वार्ड प्रोफ़ाइल देखें',
    applyFilters: 'मानचित्र फ़िल्टर लागू करें',
    viewTrendBtn: 'रुझान देखें',
    viewRecsBtn: 'सिफारिशें देखें',
    viewDetails: 'विवरण देखें',
    hideDetails: 'विवरण छुपाएं',
    close: 'बंद करें',
    noData: 'इस चयन के लिए कोई डेटा उपलब्ध नहीं है।',

    // Risk Categories
    riskHigh: 'उच्च जोखिम',
    riskModerate: 'मध्यम जोखिम',
    riskLow: 'कम जोखिम',

    // Explainable AI & SHAP
    shapTitle: 'व्याख्यात्मक एआई (SHAP) — कारक विश्लेषण',
    shapSubtitle: 'गर्मी के जोखिम का गणितीय विश्लेषण',
    positiveDrivers: 'जोखिम बढ़ाने वाले कारक',
    negativeDrivers: 'गर्मी कम करने वाले सुरक्षात्मक कारक',
    groundedNarrative: 'सरल भाषा में व्याख्या',

    // Scenario Analysis
    scenarioTitle: 'भविष्य परिदृश्य सिमुलेशन इंजन',
    scenarioSubtitle: 'वृक्षारोपण या कंक्रीट विस्तार के प्रभाव का मॉडल',
    paramGreenCover: 'हरियाली आवरण में वृद्धि (NDVI)',
    paramUrbanExpansion: 'कंक्रीट निर्माण विस्तार (Built-up)',
    paramCoolRoofs: 'कूल रूफ और हाई-एल्बेडो कोटिंग',
    currentBaseline: 'वर्तमान स्थिति',
    simulatedFuture: 'सिमुलेटेड भविष्य',
    netDeltaChange: 'शुद्ध HVI प्रभाव',

    // Ward Profile
    profHviBtn: 'HVI अवलोकन',
    profDomainBtn: 'तीन-क्षेत्रीय मूल्यांकन',
    profIndicatorsBtn: 'संवेदनशीलता सूचकांक',
    profShapBtn: 'SHAP विश्लेषण व्याख्या',

    // Social Vulnerability
    socialVulnTitle: 'सामाजिक और जनसांख्यिकीय गर्मी संवेदनशीलता',
    socialVulnSubtitle: 'संवेदनशील आबादी के लिए सुरक्षा योजना',
    elderlyGroup: 'वरिष्ठ नागरिक जनसंख्या',
    childrenGroup: 'बच्चे (0–6)',
    femaleGroup: 'महिला जनसंख्या',
    workersGroup: 'बाहरी कार्यकर्ता',
    slumGroup: 'कम आय वाले समुदाय',
    healthGapGroup: 'स्वास्थ्य सेवा पहुंच',

    // Comparison & Trends
    compHviBtn: 'HVI तुलना',
    compLstBtn: 'LST तापमान तुलना',
    compNdviBtn: 'वनस्पति / NDVI तुलना',
    compPopBtn: 'जनसंख्या घनत्व तुलना',
    compHealthBtn: 'स्वास्थ्य अवसंरचना अंतर',

    trendLstBtn: 'LST रुझान',
    trendNdviBtn: 'NDVI रुझान',
    trendBuiltupBtn: 'कंक्रीट विस्तार',
    trendPopBtn: 'जनसंख्या दबाव',

    // General Public View
    chwTitle: 'सामान्य जन सलाह एवं सूचना डैशबोर्ड',
    chwSubtitle: 'स्पष्ट गर्मी जोखिम सलाह, सावधानियां, आपातकालीन नंबर और शीतलन केंद्र।',
    symptomsToWatch: 'हीट स्ट्रोक के लक्षण',
    emergencyContact: 'आपातकालीन चिकित्सा संपर्क',
    coolingCentresAvailable: 'सार्वजनिक कूलिंग सेंटर',

    // Map Controls
    mapLayerHVI: 'हीट वल्नेरेबिलिटी इंडेक्स (HVI)',
    mapLayerLST: 'सतह तापमान (LST °C)',
    mapLayerNDVI: 'वनस्पति सूचकांक (NDVI)',
    mapLayerHealth: 'स्वास्थ्य केंद्र (UHC)'
  }
};

export function getTranslation(lang: Language) {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
