import api from "./api";

export const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScUzB6Lban0N0UuuZDSf8LnK1lVmmY-esA3I4VuxAszpiHb8w/viewform";

export const GOOGLE_FORM_ENTRY_IDS = {
  projectName: "entry.258669540",
  callerName: "entry.794811718",
  smName: "entry.1613833775",
  clientName: "entry.1641987222",
  clientType: "entry.1248831155",
  svNumber: "entry.1733847092",
  clientNumberLast4: "entry.1027457579",
  visitDate: "entry.1264216074",
  cpFirmName: "entry.1808465561",
  topology: "entry.1027082662",
};

export const VISIT_PROJECTS = [
  "DOSTI WEST COUNTY",
  "DOSTI GREATER THANE",
  "DOSTI 604",
  "DOSTI EASTERN BAY",
  "DOSTI MEZZO 22",
  "ONE DOSTI",
  "DOSTI WILLOW",
];

export const VISIT_CLIENT_TYPES = ["SINGLE", "FAMILY"];

export const VISIT_TOPOLOGIES = ["1BHK", "2BHK", "3BHK", "4BHK", "COMMERCIAL"];

export const VISIT_SM_NAMES = [
  "ASIM SHAIKH", "IMTIYAZ KHAN", "RITESH THAKUR", "SURAJ YADAV", "NIKHIL SINHA",
  "SAMEER CHAUDHARY", "TEJAS DAWKE", "AMIR NATEKAR", "DANISH KHAN", "JEET VICHARE",
  "MUDDASSIR SHAIKH", "SHRADDHA JADHAV", "VINAY WANMARI", "HASAN SAYYED",
  "KETAN OVHAL", "PRERNA RAUT", "NITIN KURADE", "ABHISHEK PALKAR", "JITEN BHANSALI",
  "ROHIT KANAUJIYA", "SURESH VANNIYAR", "RANJAN SINGH", "ADITYA RAUL", "RISHIKESH",
  "PUSHPAK", "SANTOSH JAISWAL", "RONIT KADWADKAR", "KHUSHNOOM ANKLESWARIA",
  "RAHULTRIUWA", "SIDDHARTH SUNAM", "SHRIDHAR", "ANAMIKA", "CHETANA",
  "KARANVEER SINGH", "BHAVIN BORICHA", "SACHIN THORAT", "JAYESH KAMBLE",
  "VISHAL GAIKWAD", "VIJAY NETTATH", "VIVEK PANDEY", "JANHVI CHHEDA",
  "APSAR AHMAD", "HARESH RAJA", "MANOJ UDASI", "SIMRAN AGRWAL", "NAVIN KRISHNANI",
];

export const VISIT_CALLER_NAMES = [
  "AMAN VISHWAKARMA", "SAEED KHAN", "VANSH JAISWAL", "AMISHA VOHRA", "AKANSHA SAHRMA",
  "TANU MISHRA", "SAGER ZINJURDE", "SHRUTI JADHAV", "JIJI NADAR", "NOOR SABA FATIMA",
  "SADHNA DHVALE", "SHAHZAD MANSOORI", "RITIK RAIKAR", "POOJA JADEJA", "SIMRAN PAL",
  "PRITI CHAUDHARY", "ANITA GAVLI", "VRUSHALI DALVI", "PRIYANKA GUPTA", "FARAH SHAIKH",
  "MISBA SHAIKH", "KRISHNA YADAV", "SAWAN GUPTA", "SHIREEN MOMIN", "SUBHANA ANSARI",
  "PRIYANKA RAO", "ANURAG YADAV", "RUCHI SINGH", "ASHA VISHWAKARMA", "RAHUL JAIN",
  "HAMMAD KHAN", "VRIDHI GUPTA", "KHUSHI SINGH", "RINKU JAISWAR", "ALISHA GUSAI",
  "NAMIRA SAYYED", "SIDDHESH DERE", "PRIYA SHARMA", "IQRA KHAN", "SANIYA MUKADAM",
  "PRAJKATA JADHAV", "SHIWANI TIWARI", "VAISHANAVI MORE", "AANCHAL MOURYA", "JYOTI SINGH",
  "ANITA YADAV", "AARTI CHAUHAN", "ANSHIKA", "SALONI GHATAL", "Aslam Shaikh",
  "Tejasvi shravane", "Nitu choudhary", "TANVI CHAVAN", "PRIYA BHALERAO", "DHEERAJ PAWAR",
  "CHAYA YADAV", "YASH PATIL", "NEHARIKA  MISHRA", "SEJAL PAL", "AHSAN KHAN",
  "MAMTA SONAR", "AACHAL GUPTA", "AKHIL NEGI", "MUSKAN SHAIKH", "SUDDHARTH MHADALEKAR",
  "DEEPTI UCHIL", "LATIKA NIKAM", "VEDIKA RAMRAKHYANI", "SUFIYAN KHAN", "SUKHBIR SINGH",
  "SHEETAL JAGTAP", "SACHIN PAL", "BABITA GUPTA", "SHIVANI TIWARI", "PRITISH SHARMA",
  "JAYESH PANJWANI", "ZUBER KHAN", "SHIVAM SHARMA", "VISHESHTA MUNGREJA", "SHRUTI KUKREJA",
  "KALPANA KAROTIYA", "ZULFIQEAR SAYYED", "ANIKET BELORKAR", "MIT BHANJAR", "AARJU DUBEY",
  "NABILA MOMIN", "SAMREEN RAKHANGI", "MRUNALI ADHAV", "AJIT YADAV", "UJJWAL PANDEY",
  "VENKATESH RATHOD", "SONU BHOIR", "AKANSHA SINGH", "SANKALP PUKLE", "NILESH PANDEY",
  "ISMAIL KHAN", "PRIYANKA SHASHTRI", "PRIYANSHU AGNIHOTRI", "DIPESH VIRWANI", "ZAINUL SHAIKH",
];

export const buildPreFilledGoogleFormUrl = (data) => {
  const params = new URLSearchParams();
  params.append("usp", "pp_url");

  if (data.projectName) params.append(GOOGLE_FORM_ENTRY_IDS.projectName, data.projectName);
  if (data.callerName) params.append(GOOGLE_FORM_ENTRY_IDS.callerName, data.callerName);
  if (data.smName) params.append(GOOGLE_FORM_ENTRY_IDS.smName, data.smName);
  if (data.clientName) params.append(GOOGLE_FORM_ENTRY_IDS.clientName, data.clientName);
  if (data.clientType) params.append(GOOGLE_FORM_ENTRY_IDS.clientType, data.clientType);
  if (data.svNumber) params.append(GOOGLE_FORM_ENTRY_IDS.svNumber, data.svNumber);
  if (data.clientNumberLast4) params.append(GOOGLE_FORM_ENTRY_IDS.clientNumberLast4, data.clientNumberLast4);
  if (data.visitDate) params.append(GOOGLE_FORM_ENTRY_IDS.visitDate, data.visitDate);
  if (data.cpFirmName) params.append(GOOGLE_FORM_ENTRY_IDS.cpFirmName, data.cpFirmName);

  if (data.topology) {
    const list = Array.isArray(data.topology) ? data.topology : [data.topology];
    list.forEach((t) => params.append(GOOGLE_FORM_ENTRY_IDS.topology, t));
  }

  return `${GOOGLE_FORM_URL}?${params.toString()}`;
};

export const submitVisit = async (visitData) => {
  const response = await api.post("/employee/visits", visitData);
  return response.data;
};

export const getMyVisits = async (params = {}) => {
  const response = await api.get("/employee/visits/my", { params });
  return response.data;
};

