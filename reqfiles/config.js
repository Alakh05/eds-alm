const ACCESS_TOKEN = "accessToken";
const HOST_NAME = "hostName";
const HOST_CLIENT_TYPE = "hostClientType";
const UNAUTHORIZED_CODE = 401;
export const SIGN_OUT_EVENT_TYPE = "signoutFromTeams";
export const ENGLISH_LOCALE = "en-US";

const params = new URLSearchParams(window.location.search);
const accessToken = params.get(ACCESS_TOKEN);
const hostName = params.get(HOST_NAME);
const hostClientType = params.get(HOST_CLIENT_TYPE);

export const getAccessToken = () => {
  return accessToken;
};

export const getHostName = () => {
  return hostName;
};

export const getHostClientType = () => {
  return hostClientType;
};

export const getHostUrl = () => {
  return "https://" + getHostName();
};

export const langMap = {
  de: "de-DE",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  id: "id-ID",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  nb: "nb-NO",
  nl: "nl-NL",
  pl: "pl-PL",
  pt: "pt-BR",
  ru: "ru-RU",
  sv: "sv-SE",
  tr: "tr-TR",
  zh: "zh-CN",
  zz: "zz-ZZ",
};
export const availableLanguages = [
  "de",
  "en",
  "es",
  "fr",
  "id",
  "it",
  "ja",
  "ko",
  "nb",
  "nl",
  "pl",
  "pt",
  "ru",
  "sv",
  "tr",
  "zh",
  "zz",
];

export const getLocale = (locale) => {
  if (locale) {
    if (locale.length == 2) {
      return langMap[locale];
    }
    if (
      locale.length > 2 &&
      availableLanguages.includes(locale.slice(0, 2).toLowerCase())
    ) {
      return langMap[locale.slice(0, 2)];
    }
  }
  return undefined;
}

export const getBrowserLocale = () => {
  let i = 0;
  let language = undefined;
  // support for other well known properties in browsers
  console.log("Languages: " + window.navigator.languages);
  for (i = 0; i < window.navigator.languages.length; i++) {
    const navLocale = window.navigator.languages[i];
    language = getLocale(navLocale);
    if (language) {
      break;
    }
  }

  console.log("Selected lang " + language);
  return language || ENGLISH_LOCALE;
}

const ALMConfig = {
  almBaseURL: getHostUrl(),
  primeApiURL: getHostUrl() + "/primeapi/v2/",
  locale: getBrowserLocale(),
  usageType: "aem-sites",
  instancePath: "/instance.html",
  trainingOverviewPath: "/trainingOverview.html",
  hideBackButton: true,
  hideSearchInput: true,
  handleShareExternally: true,
  handleLinkedInContentExternally: getHostClientType() !== "web",
  useConfigLocale: true
};

const isPrimeUserLoggedIn = () => {
  return true;
};

const getALMConfig = () => {
  return window.ALM.ALMConfig;
};

export const addMandatoryParams = () => {
  return (
    "?" + ACCESS_TOKEN + "=" + accessToken + "&" + HOST_NAME + "=" + hostName
  );
};

export const navigateToPage = (url) => {
  window.location.href = url;
};

export function logout() {
  const logoutEvent = {
    eventType: SIGN_OUT_EVENT_TYPE,
  };
  console.log("sending logout event");
  window.parent.postMessage(logoutEvent, "*");
}

function getHeaders() {
  return {
    Accept: "application/vnd.api+json",
    Authorization: `oauth ${getAccessToken()}`,
  };
}

async function getALMUser() {
  if (!window.ALM.isPrimeUserLoggedIn()) {
    window.ALM.storage.removeItem("user");
    return;
  }

  let user = window.ALM.storage?.getItem("user");
  if (user) {
    return user;
  }
  console.log("Fetch user");
  const primeApiURL = window.ALM.ALMConfig.primeApiURL;
  const userUrl = `${primeApiURL}/user?include=account&enforcedFields[account]=extensions`;
  const headers = getHeaders();
  try {
    const userResponse = await fetch(`${userUrl}`, {
      credentials: "include",
      headers,
      method: "GET",
    });
    if (userResponse && userResponse.status == 200) {
      user = await userResponse.json();
      const userStr = JSON.stringify(user);
      console.log("set user");
      window.ALM.storage.setItem("user", userStr, 1800);
      return userStr;
    } else {
      console.error("User call failed!!");
      window.ALM.storage.removeItem("user");
      if (userResponse.status === UNAUTHORIZED_CODE) {
        logout();
      }
    }
  } catch (e) {
    window.ALM.storage.removeItem("user");
    console.log("Fetch user exception " + e);
    throw e;
  }
}

const updateALMUser = async () => {
  window.ALM.storage.removeItem("user");
  return getALMUser();
};

export async function getCatalogName(catalogId) {
  const primeApiURL = window.ALM.ALMConfig.primeApiURL;
  const catalogUrl = `${primeApiURL}/catalogs/${catalogId}`;
  const headers = getHeaders();
  try {
    const catalogResponse = await fetch(`${catalogUrl}`, {
      credentials: "include",
      headers,
      method: "GET",
    });
    if (catalogResponse && catalogResponse.status == 200) {
      let catalog = await catalogResponse.json();
      return catalog.data?.attributes?.name;
    } else {
      console.error("Catalog call failed!!");
      if (catalogResponse.status === UNAUTHORIZED_CODE) {
        logout();
      }
      return;
    }
  } catch (e) {
    console.log("Fetch catalog exception " + e);
    return;
  }
}

function getEventForTeams(type) {
  return {
    type: type,
  };
}

function sendEvent(eventDetails) {
  window.postMessage(eventDetails, "*");
}

export function navigateToTrainingOverviewPage(
  trainingId,
  trainingInstanceId = undefined
) {
  let eventDetails = getEventForTeams("almNavigateToLoInTeamsApp");
  eventDetails.trainingId = trainingId;
  if (trainingInstanceId) {
    eventDetails.trainingInstanceId = trainingInstanceId;
  }
  sendEvent(eventDetails);
}

export function navigateToInstancePage(trainingId) {
  let eventDetails = getEventForTeams("almNavigateToLoInstanceInTeamsApp");
  eventDetails.trainingId = trainingId;
  sendEvent(eventDetails);
}

function isExtensionAllowed(extension) {
  //if extension launchType is IN_APP(Iframe), then it is allowed else not allowed
  //as we cannot open a new tab or in same tab in teams App
  return extension && extension.launchType === "IN_APP";
}

window.ALM = window.ALM || {};
window.ALM.ALMConfig = ALMConfig; //window.ALM.ALMConfig || primeConfig;
window.ALM.getALMConfig = getALMConfig;
window.ALM.isPrimeUserLoggedIn = isPrimeUserLoggedIn;
window.ALM.getAccessToken = getAccessToken;
window.ALM.getALMUser = getALMUser;
window.ALM.updateALMUser = updateALMUser;
window.ALM.handleLogIn = logout;
window.ALM.navigateToTrainingOverviewPage = navigateToTrainingOverviewPage;
window.ALM.navigateToInstancePage = navigateToInstancePage;
window.ALM.isExtensionAllowed = isExtensionAllowed;