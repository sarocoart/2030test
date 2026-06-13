// DOM Elements
const introScreen = document.getElementById('intro');
const quizScreen = document.getElementById('quiz');
const resultScreen = document.getElementById('result');

const startBtn = document.getElementById('start-btn');
const optionA = document.getElementById('option-a');
const optionB = document.getElementById('option-b');
const retryBtn = document.getElementById('retry-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const saveImgBtn = document.getElementById('save-img-btn');

const progressBar = document.getElementById('progress-bar');
const currentQSpan = document.getElementById('current-q');
const questionText = document.getElementById('question-text');

// Result Elements
const todayDate = document.getElementById('today-date');
const resultMbtiMask = document.getElementById('result-mbti-mask');
const resultMbtiReal = document.getElementById('result-mbti-real');
const accuracyPercent = document.getElementById('accuracy-percent');
const gaugeFill = document.getElementById('gauge-fill');
const resultTitle = document.getElementById('result-title');
const resultMask = document.getElementById('result-mask');
const resultInner = document.getElementById('result-inner');
const resultReason = document.getElementById('result-reason');
const resultAdvice = document.getElementById('result-advice');
const resultSecretWeapon = document.getElementById('result-secret-weapon');
const resultOneLiner = document.getElementById('result-one-liner');
const chemGood = document.getElementById('chem-good');
const chemGoodDesc = document.getElementById('chem-good-desc');
const chemBad = document.getElementById('chem-bad');
const chemBadDesc = document.getElementById('chem-bad-desc');

// State Variables
let currentQuestionIndex = 0;
let maskScores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
let realScores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };

// Initialization
function init() {
  const today = new Date();
  todayDate.innerText = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} 발행`;

  startBtn.addEventListener('click', startQuiz);
  optionA.addEventListener('click', () => handleOptionClick(0));
  optionB.addEventListener('click', () => handleOptionClick(1));
  retryBtn.addEventListener('click', resetQuiz);
  copyLinkBtn.addEventListener('click', shareLink);
  saveImgBtn.addEventListener('click', saveDiagnosisAsImage);

  Analytics.track('visit');
}

// Start Quiz
function startQuiz() {
  Analytics.track('start_test');

  introScreen.classList.remove('active');
  introScreen.classList.add('hidden');
  
  setTimeout(() => {
    quizScreen.classList.remove('hidden');
    quizScreen.classList.add('active');
    renderQuestion();
  }, 300);
}

// Render Question
function renderQuestion() {
  const q = quizData[currentQuestionIndex];
  questionText.innerText = q.question;
  optionA.innerText = q.options[0].text;
  optionB.innerText = q.options[1].text;
  
  currentQSpan.innerText = currentQuestionIndex + 1;
  progressBar.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;
}

// Handle Option Click
function handleOptionClick(optionIndex) {
  const selectedOption = quizData[currentQuestionIndex].options[optionIndex];
  
  // Dual Logic Accumulation
  maskScores[selectedOption.mask] += (selectedOption.maskWeight || 1);
  realScores[selectedOption.real] += (selectedOption.realWeight || 1);
  
  Analytics.track('answer_question', { questionNumber: currentQuestionIndex + 1 });
  
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    const optionsDiv = document.querySelector('.options');
    optionsDiv.style.opacity = 0;
    setTimeout(() => {
      renderQuestion();
      optionsDiv.style.opacity = 1;
    }, 200);
  } else {
    Analytics.track('complete_test');
    showResult();
  }
}

// Calculate MBTI and Show Result
function showResult() {
  // Mask MBTI
  let maskMbti = "";
  maskMbti += (maskScores.E >= maskScores.I) ? "E" : "I";
  maskMbti += (maskScores.N >= maskScores.S) ? "N" : "S";
  maskMbti += (maskScores.T >= maskScores.F) ? "T" : "F";
  maskMbti += (maskScores.J >= maskScores.P) ? "J" : "P";
  
  // Real MBTI
  let realMbti = "";
  realMbti += (realScores.E >= realScores.I) ? "E" : "I";
  realMbti += (realScores.N >= realScores.S) ? "N" : "S";
  realMbti += (realScores.T >= realScores.F) ? "T" : "F";
  realMbti += (realScores.J >= realScores.P) ? "J" : "P";
  
  // Base result logic primarily on REAL MBTI for the personality descriptions
  // (In a real app, you might have mixed results or base it on Mask vs Real combos)
  const result = resultData[realMbti] || resultData.INTJ; // fallback to INTJ if missing
  
  // Calculate Similarity Percentage
  let matchCount = 0;
  for(let i=0; i<4; i++) {
    if(maskMbti[i] === realMbti[i]) matchCount++;
  }
  
  // Calculate percentage (0~4 -> 10% ~ 95% scaling for fun)
  let percentage = 0;
  if(matchCount === 4) percentage = 95;
  else if(matchCount === 3) percentage = 75;
  else if(matchCount === 2) percentage = 50;
  else if(matchCount === 1) percentage = 25;
  else percentage = 10;
  
  // Render Data
  resultMbtiMask.innerText = maskMbti;
  resultMbtiReal.innerText = realMbti;
  accuracyPercent.innerText = `${percentage}%`;
  
  resultTitle.innerText = result.title;
  resultMask.innerText = result.mask;
  resultInner.innerText = result.inner;
  resultReason.innerText = result.reason;
  resultAdvice.innerText = result.advice;
  
  resultSecretWeapon.innerText = result.secretWeapon || "업데이트 예정입니다.";
  resultOneLiner.innerText = result.oneLiner || "업데이트 예정입니다.";
  
  chemGood.innerText = result.good;
  chemGoodDesc.innerText = result.goodDesc;
  chemBad.innerText = result.bad;
  chemBadDesc.innerText = result.badDesc;
  
  // 구글 시트로 데이터 전송 (기존 방식 대신 Analytics 활용)
  Analytics.track('result_generated', {
    maskMbti: maskMbti,
    coreMbti: realMbti,
    mbtiCombination: result.title
  });
  
  // 기존 결과 저장 기능 완벽 유지
  sendDataToGoogleSheet(maskMbti, realMbti, percentage, result.title);
  
  // Switch Screens
  quizScreen.classList.remove('active');
  quizScreen.classList.add('hidden');
  
  setTimeout(() => {
    resultScreen.classList.remove('hidden');
    resultScreen.classList.add('active');
    
    // Animate Gauge
    setTimeout(() => {
      gaugeFill.style.width = `${percentage}%`;
    }, 500);
  }, 300);
}

function resetAllScrollPositions() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const scrollTargets = [
    document.querySelector('.app'),
    document.querySelector('.container'),
    document.querySelector('.main-container'),
    document.querySelector('.result-container'),
    document.querySelector('.result-card'),
    document.querySelector('.test-container'),
    document.querySelector('#app'),
    document.querySelector('#result'),
    document.querySelector('#start-screen')
  ];

  scrollTargets.forEach((el) => {
    if (el) {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    }
  });
}

// Reset Quiz
function resetQuiz() {
  Analytics.track('retry_test');
  currentQuestionIndex = 0;
  maskScores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  realScores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  gaugeFill.style.width = '0%';
  
  resultScreen.classList.remove('active');
  resultScreen.classList.add('hidden');
  
  resetAllScrollPositions();
  
  setTimeout(() => {
    introScreen.classList.remove('hidden');
    introScreen.classList.add('active');
    
    // DOM 렌더링 직후 스크롤 보장
    setTimeout(() => {
      resetAllScrollPositions();
    }, 0);
    
    setTimeout(() => {
      resetAllScrollPositions();
    }, 100);
  }, 300);
}

// Share Link
function shareLink() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: '나의 사회적 가면 & 속마음 번역기',
      text: '가면과 본성을 동시에 분석하는 심리테스트!',
      url: url
    }).then(() => {
      Analytics.track('share_result', { shareType: 'navigator_share' });
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(url).then(() => {
      Analytics.track('share_result', { shareType: 'clipboard' });
      alert("링크가 복사되었습니다. 친구들에게 공유해보세요!");
    }).catch(err => {
      alert("링크 복사에 실패했습니다.");
    });
  }
}

// Save Diagnosis as Image
function saveDiagnosisAsImage() {
  const originalText = saveImgBtn.innerText;
  saveImgBtn.innerText = "⏳ 저장 중...";
  saveImgBtn.disabled = true;

  const resultContainer = document.querySelector('.result-container');
  const adBanner = document.querySelector('.mobile-ad-banner.bottom-ad');
  
  // 광고 잠시 숨기기
  if (adBanner) adBanner.style.display = 'none';

  // html2canvas 옵션: 스케일 높여서 화질 개선
  html2canvas(resultContainer, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    // 숨겼던 광고 다시 표시
    if (adBanner) adBanner.style.display = '';

    const link = document.createElement('a');
    link.download = '나의-사회적-가면-진단서.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    Analytics.track('pdf_download');

    saveImgBtn.innerText = originalText;
    saveImgBtn.disabled = false;
  }).catch(err => {
    console.error('Image save error:', err);
    if (adBanner) adBanner.style.display = '';
    saveImgBtn.innerText = originalText;
    saveImgBtn.disabled = false;
    alert("이미지 저장에 실패했습니다.");
  });
}

// 구글 시트로 데이터 전송 (기존 기능)
function sendDataToGoogleSheet(maskMbti, realMbti, percentage, title) {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycrArURTSPezLuutSzNBAmoDicYSGonYx-shxdZruvJGfqKNNCCmrJ6Cu2BHPtaQJnZg/exec";
  
  if (!SCRIPT_URL || SCRIPT_URL.includes("여기에")) return;
  
  const formData = new FormData();
  formData.append('maskMbti', maskMbti);
  formData.append('realMbti', realMbti);
  formData.append('percentage', percentage);
  formData.append('title', title);
  
  fetch(SCRIPT_URL, {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
  }).catch(err => console.error("Error:", err));
}

// Start & Global Listeners
window.addEventListener('DOMContentLoaded', () => {
  init();

  // Exit Question Tracking (창 닫기/새로고침 시)
  window.addEventListener('beforeunload', () => {
    // 퀴즈 화면이 활성화되어 있고 마지막 문제가 아니라면 이탈로 간주
    if (quizScreen.classList.contains('active') && currentQuestionIndex < 12) {
      Analytics.track('exit_question', { questionNumber: currentQuestionIndex + 1 });
    }
  });

  // Ad Impression & Click Tracking
  const ads = document.querySelectorAll('.mobile-ad-banner, .pc-ad-banner');
  if (ads.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Analytics.track('ad_impression', { 
            adPosition: entry.target.classList.contains('bottom-ad') ? 'bottom' : 'sidebar',
            adName: 'coupang_partner'
          });
          observer.unobserve(entry.target); // 한 번 노출되면 더 이상 추적하지 않음
        }
      });
    }, { threshold: 0.5 }); // 50% 이상 보일 때

    ads.forEach(ad => {
      observer.observe(ad);
      ad.addEventListener('click', () => {
        Analytics.track('ad_click', {
          adPosition: ad.classList.contains('bottom-ad') ? 'bottom' : 'sidebar',
          adName: 'coupang_partner'
        });
      });
    });
  }
});
