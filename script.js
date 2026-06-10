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
const resultMbti = document.getElementById('result-mbti');
const resultTitle = document.getElementById('result-title');
const resultMask = document.getElementById('result-mask');
const resultInner = document.getElementById('result-inner');
const chemGood = document.getElementById('chem-good');
const chemBad = document.getElementById('chem-bad');

// State Variables
let currentQuestionIndex = 0;
let scores = {
  E: 0, I: 0,
  N: 0, S: 0,
  T: 0, F: 0,
  J: 0, P: 0
};

// Initialization
function init() {
  // Set today's date
  const today = new Date();
  todayDate.innerText = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} 발행`;

  // Event Listeners
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
  }, 300); // Wait for transition
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
  scores[selectedOption.type]++;
  
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    // Subtle animation effect for options
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
  let mbti = "";
  mbti += (scores.E >= scores.I) ? "E" : "I";
  mbti += (scores.N >= scores.S) ? "N" : "S";
  mbti += (scores.T >= scores.F) ? "T" : "F";
  mbti += (scores.J >= scores.P) ? "J" : "P";
  
  const result = resultData[mbti];
  
  // Render Data
  resultMbti.innerText = mbti;
  resultTitle.innerText = result.title;
  resultMask.innerText = result.mask;
  resultInner.innerText = result.inner;
  chemGood.innerText = result.good;
  chemBad.innerText = result.bad;
  
  // Switch Screens
  quizScreen.classList.remove('active');
  quizScreen.classList.add('hidden');
  
  setTimeout(() => {
    resultScreen.classList.remove('hidden');
    resultScreen.classList.add('active');
  }, 300);
}

// Reset Quiz
function resetQuiz() {
  currentQuestionIndex = 0;
  scores = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  
  resultScreen.classList.remove('active');
  resultScreen.classList.add('hidden');
  
  setTimeout(() => {
    introScreen.classList.remove('hidden');
    introScreen.classList.add('active');
  }, 300);
}

// Share Link
function shareLink() {
  const url = window.location.href;
  
  // Try Web Share API first (Mobile)
  if (navigator.share) {
    navigator.share({
      title: '나의 사회적 가면 & 속마음 번역기',
      text: '당신의 영혼은 안전하십니까? 현대인 생존 테스트!',
      url: url
    }).catch((error) => console.log('Error sharing', error));
  } else {
    // Fallback to Clipboard API
    navigator.clipboard.writeText(url).then(() => {
      alert("링크가 복사되었습니다. 친구들에게 공유해보세요!");
    }).catch(err => {
      alert("링크 복사에 실패했습니다.");
    });
  }
}

// Start
window.addEventListener('DOMContentLoaded', init);
