const AdManager = (function() {
  let adsCache = null;
  let isFetching = false;
  let fetchPromise = null;

  async function fetchAds() {
    if (adsCache) return adsCache;
    if (isFetching) return fetchPromise;

    isFetching = true;
    const url = window.ENV.GOOGLE_SHEETS_AD_URL + "?action=getAds";

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
      if (data && data.status === 'success' && data.data) {
        // Filter active ads and sort by sortOrder
        adsCache = data.data
          .filter(ad => ad.active === true || ad.active === 'TRUE' || ad.active === 'true')
          .sort((a, b) => parseInt(a.sortOrder) - parseInt(b.sortOrder));
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
      return ads.filter(ad => ad.category === 'recommended');
    }
  };
})();
