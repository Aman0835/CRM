const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScUzB6Lban0N0UuuZDSf8LnK1lVmmY-esA3I4VuxAszpiHb8w/viewform";
const GOOGLE_FORM_RESPONSE_URL = "https://docs.google.com/forms/d/e/1FAIpQLScUzB6Lban0N0UuuZDSf8LnK1lVmmY-esA3I4VuxAszpiHb8w/formResponse";

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

/**
 * Builds the URL-encoded parameters for Google Form submission
 */
export const buildGoogleFormData = (data) => {
  const params = new URLSearchParams();

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

  params.append("fvv", "1");
  params.append("pageHistory", "0");
  return params;
};

/**
 * Generates a pre-filled Google Form URL for opening in browser
 */
export const buildPreFilledGoogleFormUrl = (data) => {
  const params = buildGoogleFormData(data);
  params.set("usp", "pp_url");
  params.delete("fvv");
  params.delete("pageHistory");
  return `${GOOGLE_FORM_URL}?${params.toString()}`;
};

/**
 * Sends a POST request to Google Forms formResponse endpoint
 */
export const submitToGoogleForm = async (data) => {
  try {
    const params = buildGoogleFormData(data);
    const response = await fetch(GOOGLE_FORM_RESPONSE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: params.toString(),
      redirect: "manual",
    });

    // Google forms responds with 200 or 302/303 redirect on successful submission
    const isSuccess = response.status >= 200 && response.status < 400;
    return {
      success: isSuccess,
      status: response.status,
    };
  } catch (error) {
    console.error("Google form submission error:", error.message);
    return {
      success: false,
      status: 500,
      error: error.message,
    };
  }
};

