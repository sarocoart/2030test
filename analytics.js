const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyUzW2UHn6LtnG10Uyt39HcH1yZrY5NvdoRfPsSCXQddye8Nbs3ry-8xMcKqpK3QPdMRQ/exec";

const Analytics = (function() {
  function generateId() {
    return 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function getVisitorId() {
    let vid = localStorage.getItem('visitorId');
    if (!vid) {
      vid = generateId();
      localStorage.setItem('visitorId', vid);
    }
    return vid;
  }

  function getCommonData(eventType) {
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // 현재 페이지 구하기 (Intro, Quiz, Result)
    let currentPage = "unknown";
    if (document.getElementById('intro') && document.getElementById('intro').classList.contains('active')) currentPage = "intro";
    else if (document.getElementById('quiz') && document.getElementById('quiz').classList.contains('active')) currentPage = "quiz";
    else if (document.getElementById('result') && document.getElementById('result').classList.contains('active')) currentPage = "result";

    return {
      timestamp: new Date().toISOString(),
      visitorId: getVisitorId(),
      eventType: eventType,
      source: document.referrer || "direct",
      currentPage: currentPage,
      questionNumber: "",
      totalQuestions: 12,
      maskMbti: "",
      coreMbti: "",
      mbtiCombination: "",
      shareType: "",
      adPosition: "",
      adName: "",
      pdfDownloaded: "",
      userAgent: navigator.userAgent,
      screenWidth: screenWidth,
      screenHeight: screenHeight
    };
  }

  function trackEvent(eventType, extraData = {}) {
    if (!GOOGLE_SHEETS_WEBHOOK_URL || GOOGLE_SHEETS_WEBHOOK_URL.includes("여기에")) {
      console.warn("Analytics: Webhook URL is not configured. Event:", eventType, extraData);
      return;
    }

    const payload = Object.assign({}, getCommonData(eventType), extraData);
    console.log(`Analytics Sending: [${eventType}]`, payload);

    const formData = new FormData();
    for (const key in payload) {
      formData.append(key, payload[key] !== undefined && payload[key] !== null ? payload[key] : "");
    }

    fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    }).then(() => {
      // Success is silent
    }).catch(err => {
      console.warn("Analytics: Event tracking failed", err);
    });
  }

  return {
    track: trackEvent
  };
})();
