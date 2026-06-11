// DOM Elements
const introScreen = document.getElementById('intro');
const quizScreen = document.getElementById('quiz');
const resultScreen = document.getElementById('result');

const startBtn = document.getElementById('start-btn');
const optionA = document.getElementById('option-a');
const optionB = document.getElementById('option-b');
const retryBtn = document.getElementById('retry-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');

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
}

// Start Quiz
function startQuiz() {
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
  
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    const optionsDiv = document.querySelector('.options');
    optionsDiv.style.opacity = 0;
    setTimeout(() => {
      renderQuestion();
      optionsDiv.style.opacity = 1;
    }, 200);
  } else {
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
  
  // Reset toggles
  document.querySelectorAll('.chem-desc').forEach(el => el.classList.add('collapsed'));
  document.querySelectorAll('.toggle-desc-btn').forEach(btn => btn.innerText = "자세히 보기 ▼");

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

// Reset Quiz
function resetQuiz() {
  currentQuestionIndex = 0;
  maskScores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  realScores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  gaugeFill.style.width = '0%';
  
  resultScreen.classList.remove('active');
  resultScreen.classList.add('hidden');
  
  setTimeout(() => {
    introScreen.classList.remove('hidden');
    introScreen.classList.add('active');
  }, 300);
}

// Toggle Description
function toggleDesc(btn) {
  const descElement = btn.previousElementSibling;
  if (descElement.classList.contains('collapsed')) {
    descElement.classList.remove('collapsed');
    btn.innerText = "접어두기 ▲";
  } else {
    descElement.classList.add('collapsed');
    btn.innerText = "자세히 보기 ▼";
  }
}

// Share Link
function shareLink() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: '나의 사회적 가면 & 속마음 번역기',
      text: '가면과 본성을 동시에 분석하는 심리테스트!',
      url: url
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(url).then(() => {
      alert("링크가 복사되었습니다. 친구들에게 공유해보세요!");
    }).catch(err => {
      alert("링크 복사에 실패했습니다.");
    });
  }
}

// Ensure toggleDesc is globally available
window.toggleDesc = toggleDesc;

// Start
window.addEventListener('DOMContentLoaded', init);
