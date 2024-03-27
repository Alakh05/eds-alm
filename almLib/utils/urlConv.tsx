const LEARNER_DESKTOP_PARAMS_MAP = {
    "skillLevel": {
        "1" : "beginnerSelected=true",
        "2" : "intermediateSelected=true",
        "3" : "advancedSelected=true"
    },
    "learnerState" :{
        "enrolled" : "enrolledSelected=true",
        "completed" : "completedSelected=true",
        "started" : "notenrolledSelected=true",
        "notenrolled" : "notenrolled=true"
    },
    "loFormat" :{
        "Activity" : "activitySelected=true",
        "Blended": "blendedSelected=true",
        "Self+Paced" : "selfPacedSelected=true",
        "Virtual+Classroom": "virtualClassroomSelected=true" ,
        "Classroom" : "classroomSelected=true"
    },
    "loTypes" : {
        "course" : "courseSelected=true",
        "learningProgram" : "lpsSelected=true",
        "jobAid" : "jobAidsSelected=true",
        "certification" : "certificationsSelected=true",
    },
    "duration" :{
        "0-1800" : "shortDurationSelected=true",
        "1801-7200" : "mediumDurationSelected=true",
        "7201-3600000" : "longDurationSelected=true",
    },
    "tagName" : "selectedTags",
    "searchText":"searchText",
    "skillName": "selectedCategories",
    "cities":"selectedCities",
    "catalogs":"selectedListableCatalogIds",
   

  
} as any;

const REACT_PARAMS_MAP ={
    "skillLevel": {
        "1" : "beginnerSelected",
        "2" : "intermediateSelected",
        "3" : "advancedSelected"
    },
    "learnerState" :{
        "enrolled" : "enrolledSelected",
        "completed" : "completedSelected",
        "started" : "notenrolledSelected",
        "notenrolled" : "notenrolled"
    },
    "loFormat" :{
        "Activity" : "activitySelected",
        "Blended": "blendedSelected",
        "Self Paced" : "selfPacedSelected",
        "Virtual Classroom": "virtualClassroomSelected" ,
        "Classroom" : "classroomSelected"
    },
    "loTypes" : {
        "course" : "courseSelected",
        "learningProgram" : "lpsSelected",
        "jobAid" : "jobAidsSelected",
        "certification" : "certificationsSelected",
    },
    "duration" :{
        "0-1800" : "shortDurationSelected",
        "1801-7200" : "mediumDurationSelected",
        "7201-3600000" : "longDurationSelected",
    },
    "selectedTags" : "tagName",
    "searchText":"searchText",
    "selectedCategories": "skillName",
    "selectedCities" : "cities",
    "selectedListableCatalogIds":"catalogs"
} as any;

const dynamicFilters = ["tagName", "skillName", "cities", "catalogs"];
const dynamicSelectedFilters = ["selectedTags", "selectedCategories", "selectedCities", "selectedListableCatalogIds"];
const EMPTY_STR = "";

function formatString (str: string){
    // function to create the format of params from '["a","b","c"]' to 'a,b,c'
    return str.replace(/"/g, '').replace("[", "").replace("]", "");
}

function formatParam(str: String) {
    return str.replace(/\?/g,'').toString();
}

function getFormattedQp(key: string, value: string) {
    return `${key}=${value}&`
}

export function convertToLearnerDesktopParams(){
    const url = new URL(window.location.href); 
    const paramsList = url.search.split("&");
    const dataMap = {} as any;
    if (paramsList.length === 0) {
        return EMPTY_STR;
    }
    for (const params of paramsList) {
        const currentParam = decodeURIComponent(decodeURIComponent(params));
        const [key, value] = currentParam.split("=");
        if (value) {
            dataMap[key] = value.split(",");
        }
    }
    
    let learnerDesktopQueryParams = EMPTY_STR;
    for (const key in dataMap) {
        const currentParam = formatParam(key);
        if (dynamicFilters.indexOf(currentParam) > -1) {
            const paramValue = []
            for (const value of dataMap[key]) {
                paramValue.push("\"" + value.toString() + "\"");
            }
            learnerDesktopQueryParams += getFormattedQp(LEARNER_DESKTOP_PARAMS_MAP[currentParam], `[${paramValue.toString()}]`);
        } else if (currentParam === "searchText") {
            learnerDesktopQueryParams += getFormattedQp(currentParam, dataMap[key]);
        } else {
            for (const value of dataMap[key]) {
                learnerDesktopQueryParams += (LEARNER_DESKTOP_PARAMS_MAP[currentParam] && LEARNER_DESKTOP_PARAMS_MAP[currentParam][value]) ? `${LEARNER_DESKTOP_PARAMS_MAP[currentParam][value]}&` : ``;
            }
        }
        

    }
    return encodeURI(learnerDesktopQueryParams.slice(0,-1));
}
export function convertJsonToUri( obj : any){
    let str = "";
    for (const key in obj) {
        str += key + "=" + obj[key] + "&";
    }
    return str;
}
export function convertToReactParams( params : any){
    const keys = Object.keys(params);
    const dataMap = {} as any;
    for (const key of keys) {
        if (dynamicSelectedFilters.indexOf(key) > -1) {
            dataMap[REACT_PARAMS_MAP[key]] = formatString(params[key]);
        } else if (key === "searchText") {
            dataMap[key] = params[key].toString();
        } else {
            const reactQueryParam = findKeysByValue(REACT_PARAMS_MAP, key)[0];
            if (reactQueryParam !== undefined) {
                const [param, value] = reactQueryParam.split(".");
                if (dataMap[param] === undefined) {
                    dataMap[param] = [];
                }
                dataMap[param].push(value.toString());
            }
        }
    }
    return dataMap;
} ;

function findKeysByValue(obj: any, value: any): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];

      if (val === value) {
        keys.push(key);
      } else if (typeof val === 'object') {
        const nestedKeys = findKeysByValue(val as any, value);
        keys.push(...nestedKeys.map((nestedKey) => `${key}.${nestedKey}`));
      }
    }
  }

  return keys;
}




