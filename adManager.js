const AdManager = (function() {
  let adsCache = null;
  let isFetching = false;
  let fetchPromise = null;

  async function fetchAds() {
    if (adsCache) return adsCache;
    if (isFetching) return fetchPromise;

    isFetching = true;
    const url = window.ENV.GOOGLE_SHEETS_AD_URL + "?action=getAds&t=" + Date.now();
    console.log("GOOGLE_SHEETS_AD_URL:", window.ENV.GOOGLE_SHEETS_AD_URL);

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
      console.log('Fetched Ad Data:', data); // 6. Add console.log for fetched ad data.
      
      if (data && data.status === 'success' && data.data) {
        if (data.data.length === 0) {
          console.warn('WARNING: The ad sheet returned 0 rows. Check if the Apps Script is connected to the correct Spreadsheet, and the "ad" sheet has data beyond the header row.'); // 7. If data is empty, show a clear console warning.
        }
        
        // 9. If data.data exists, use data.data as ads array.
        const rawAds = data.data;
        
        // Filter active ads and sort by sortOrder
        // 4, 5, 6. Confirm active values TRUE are recognized as active (support boolean and string)
        adsCache = rawAds
          .filter(ad => ad.active === true || ad.active === 'TRUE' || String(ad.active).toUpperCase() === 'TRUE')
          .sort((a, b) => parseInt(a.sortOrder) - parseInt(b.sortOrder));
          
        console.log('Filtered Active Ads:', adsCache);
      } else {
        adsCache = [];
      }
      isFetching = false;
      return adsCache;
    })
    .catch(error => {
      console.error('AdManager Error:', error);
      adsCache = [];
      isFetching = false;
      return adsCache;
    });

    return fetchPromise;
  }

  return {
    init: async function() {
      if (!window.ENV.ENABLE_ADSENSE) {
        await fetchAds();
      }
    },

    getTopBanner: async function() {
      const ads = await fetchAds();
      return ads.find(ad => parseInt(ad.adId) === 1);
    },

    getBottomBanner: async function() {
      const ads = await fetchAds();
      return ads.find(ad => parseInt(ad.adId) === 2);
    },

    getRecommendedAds: async function() {
      const ads = await fetchAds();
      const recommendedAds = ads.filter(ad => ad.category === 'recommended' && (ad.active === true || ad.active === 'TRUE' || String(ad.active).toUpperCase() === 'TRUE'));
      console.log("Recommended Ads:", recommendedAds);
      return recommendedAds;
    }
  };
})();
