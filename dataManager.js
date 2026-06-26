const DataManager = (function() {
  let dataCache = { ads: null, config: null };
  let isFetching = false;
  let fetchPromise = null;

  async function fetchData() {
    if (dataCache.ads && dataCache.config) return dataCache;
    if (isFetching) return fetchPromise;

    isFetching = true;
    const url = window.ENV.GOOGLE_SHEETS_AD_URL + "?action=getAll&t=" + Date.now();
    console.log("GOOGLE_SHEETS_API_URL:", window.ENV.GOOGLE_SHEETS_AD_URL);

    fetchPromise = fetch(url, {
      method: 'GET',
      redirect: 'follow'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Fetched API Data:', data);
      
      if (data && data.status === 'success' && data.data) {
        // Handle backward compatibility: if data.data is an array, it's the old API returning only ads
        if (Array.isArray(data.data)) {
            console.warn("Using old API format (ads only). Please update Code.gs to support ?action=getAll");
            dataCache.ads = processAds(data.data);
            dataCache.config = {};
        } else {
            // New API format: { ads: [...], config: [...] }
            dataCache.ads = processAds(data.data.ads || []);
            dataCache.config = processConfig(data.data.config || []);
        }
      } else {
        dataCache.ads = [];
        dataCache.config = {};
      }
      isFetching = false;
      return dataCache;
    })
    .catch(error => {
      console.error('DataManager Error:', error);
      dataCache.ads = [];
      dataCache.config = {};
      isFetching = false;
      return dataCache;
    });

    return fetchPromise;
  }

  function processAds(rawAds) {
    if (!rawAds || rawAds.length === 0) return [];
    return rawAds
      .filter(ad => ad.active === true || ad.active === 'TRUE' || String(ad.active).toUpperCase() === 'TRUE')
      .sort((a, b) => parseInt(a.sortOrder) - parseInt(b.sortOrder));
  }

  function processConfig(rawConfig) {
    if (!rawConfig || rawConfig.length === 0) return {};
    const configObj = {};
    rawConfig.forEach(item => {
        if (item.key && item.value !== undefined) {
            // Convert boolean strings to actual booleans
            let val = item.value;
            if (item.type === 'boolean' || val === 'TRUE' || val === 'FALSE') {
                val = (val === true || val === 'TRUE' || String(val).toUpperCase() === 'TRUE');
            }
            configObj[item.key] = val;
        }
    });
    return configObj;
  }

  return {
    init: async function() {
      await fetchData();
    },

    getTopBanner: async function() {
      const { ads } = await fetchData();
      return ads.find(ad => parseInt(ad.adId) === 1);
    },

    getBottomBanner: async function() {
      const { ads } = await fetchData();
      return ads.find(ad => parseInt(ad.adId) === 2);
    },

    getRecommendedAds: async function() {
      const { ads } = await fetchData();
      const recommendedAds = ads.filter(ad => ad.category === 'recommended' && (ad.active === true || ad.active === 'TRUE' || String(ad.active).toUpperCase() === 'TRUE'));
      return recommendedAds;
    },

    getConfig: async function(key, defaultValue = null) {
      const { config } = await fetchData();
      return config[key] !== undefined ? config[key] : defaultValue;
    },
    
    isFeatureEnabled: async function(key) {
      const { config } = await fetchData();
      return config[key] === true;
    }
  };
})();
