// Global Configuration
window.ENV = {
  // Toggle this to true when you are ready to switch to Google AdSense
  ENABLE_ADSENSE: false,
  
  // Your Google AdSense Client ID (e.g., "ca-pub-1234567890123456")
  ADSENSE_CLIENT_ID: "",
  
  // Google Sheets Webhook URL for fetching Ads
  // We reuse the existing analytics URL since it's the same Google Apps Script project
  GOOGLE_SHEETS_AD_URL: "https://script.google.com/macros/s/AKfycbwe1mDYx2wwnHJFyTWBYwdqac7_j1Il6uf3WVGYQY4yLUICAOq7Xy169yMohvlUlscAUQ/exec"
};
