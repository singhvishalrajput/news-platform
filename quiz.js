const GEMINI_API_KEY = 'AIzaSyC2d7BI0KPaemguwDu7VoqnAALmH04lThg';
const quizBtn = document.getElementById("generateQuizBtn");
const quizContainer = document.getElementById("quizContainer");
const resultBox = document.getElementById("resultBox");

// Utility to fetch last read articles
function getRecentArticles() {
  const cached = JSON.parse(localStorage.getItem("cachedNews")) || [];
  return cached.map(a => a.description || a.title).join("\n");
}

quizBtn.addEventListener("click", async () => {
  quizContainer.innerHTML = "Generating quiz using Gemini AI... ⏳";
  const inputText = getRecentArticles();

  const prompt = `
You are an AI quiz generator. Read the following text and generate 3 MCQ questions with 4 options each (a, b, c, d). Mark the correct option clearly. Return only the questions in this format:

Q1: What is...?
a) Option1
b) Option2
c) Option3
d) Option4
Answer: b

${inputText}
`;

  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    renderQuiz(text);
  } catch (err) {
    quizContainer.innerHTML = "Failed to generate quiz.";
    console.error(err);
  }
});

function renderQuiz(text) {
  quizContainer.innerHTML = "";
  resultBox.innerHTML = "";

  const questions = text.split(/Q\d:/).filter(Boolean);
  const quizData = [];

  questions.forEach((qRaw, index) => {
    const parts = qRaw.trim().split("Answer:");
    const qText = parts[0].trim();
    const correct = parts[1].trim().toLowerCase();

    const questionBlock = document.createElement("div");
    questionBlock.className = "quiz-question";

    const options = qText.match(/a\).*|b\).*|c\).*|d\).*/g);
    const questionTitle = qText.split('\n')[0];

    const form = document.createElement("form");
    form.innerHTML = `<p><strong>Q${index + 1}:</strong> ${questionTitle}</p>`;

    options.forEach((opt, i) => {
      const label = opt.trim();
      const value = label[0].toLowerCase();
      form.innerHTML += `
        <label>
          <input type="radio" name="q${index}" value="${value}"> ${label}
        </label><br>
      `;
    });

    quizData.push(correct);
    questionBlock.appendChild(form);
    quizContainer.appendChild(questionBlock);
  });

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "✅ Submit Quiz";
  submitBtn.onclick = (e) => {
    e.preventDefault();
    let score = 0;

    document.querySelectorAll(".quiz-question form").forEach((form, idx) => {
      const selected = form.querySelector("input:checked");
      if (selected && selected.value === quizData[idx]) {
        score++;
      }
    });

    resultBox.innerHTML = `<h3>🎉 Your Score: ${score} / ${quizData.length}</h3>`;
    localStorage.setItem("lastQuizScore", score);
  };

  quizContainer.appendChild(submitBtn);
}
