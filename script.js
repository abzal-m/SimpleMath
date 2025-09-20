let correct = 0;
let currentMode = "plusminus";
let history = [];
let mistakes = 0;
let currentAnswer = null;
let mistakesLimit = 3;
let correctTarget = 20;
let gameActive = false;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  // Определяем режим
  const mode = currentMode;
  let a, b, op;
  if (mode === "multiply") {
    op = "×";
    a = getRandomInt(1, 9);
    b = getRandomInt(1, 9);
    currentAnswer = a * b;
  } else if (mode === "plusminus") {
    op = Math.random() < 0.5 ? "+" : "-";
    a = getRandomInt(1, 90);
    b = getRandomInt(1, 90);
    if (op === "-" && b > a) [a, b] = [b, a];
    currentAnswer = op === "+" ? a + b : a - b;
  } else if (mode === "mixed") {
    // Случайно выбираем тип примера
    const type = getRandomInt(1, 3); // 1: +, 2: -, 3: ×
    if (type === 1) {
      op = "+";
      a = getRandomInt(1, 90);
      b = getRandomInt(1, 90);
      currentAnswer = a + b;
    } else if (type === 2) {
      op = "-";
      a = getRandomInt(1, 90);
      b = getRandomInt(1, 90);
      if (b > a) [a, b] = [b, a];
      currentAnswer = a - b;
    } else {
      op = "×";
      a = getRandomInt(1, 9);
      b = getRandomInt(1, 9);
      currentAnswer = a * b;
    }
  }
  window.currentTask = { a, b, op, answer: currentAnswer };
  document.getElementById("question").textContent = `${a} ${op} ${b} = ?`;
  document.getElementById("answer").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("next").style.display = "none";
  document.getElementById("submit").style.display = "";

  // Визуализация
  const vis = document.getElementById("visualization");
  vis.innerHTML = "";
  if (mode === "multiply" || (mode === "mixed" && op === "×")) {
    // Для умножения: не рисуем много фигур, показываем только текст примера
    const example = document.createElement("div");
    example.style.textAlign = "center";
    example.style.marginTop = "12px";
    example.style.fontSize = "1.3em";
    example.textContent = `${a} × ${b} = ?`;
    vis.appendChild(example);
  } else {
    // Десятичные разряды для каждого числа
    const createDecimalVisual = (num, color) => {
      const container = document.createElement("div");
      container.style.display = "inline-block";
      container.style.margin = "0 12px";
      const tens = Math.floor(num / 10);
      const units = num % 10;
      if (tens > 0) {
        const tensBar = document.createElement("div");
        tensBar.className = "tens-bar";
        for (let i = 0; i < tens; i++) {
          const bar = document.createElement("span");
          bar.className = "bar";
          bar.style.background = color;
          tensBar.appendChild(bar);
        }
        container.appendChild(tensBar);
      }
      if (units > 0) {
        const unitsRow = document.createElement("div");
        unitsRow.className = "units-row";
        for (let i = 0; i < units; i++) {
          const circle = document.createElement("span");
          circle.className = "circle";
          circle.style.background = color;
          unitsRow.appendChild(circle);
        }
        container.appendChild(unitsRow);
      }
      return container;
    };
    vis.appendChild(createDecimalVisual(a, "#ff9800"));
    const opSpan = document.createElement("span");
    opSpan.textContent = op;
    opSpan.style.fontSize = "1.7em";
    opSpan.style.margin = "0 18px";
    vis.appendChild(opSpan);
    vis.appendChild(createDecimalVisual(b, "#03a9f4"));
  }
}

function updateScore() {
  document.getElementById("correct").textContent = correct;
  document.getElementById("mistakes").textContent = mistakes;
}

function updateHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";
  history
    .slice()
    .reverse()
    .forEach((item) => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML =
        `<span class="task">${item.a} ${item.op} ${item.b} = ${item.userAnswer}</span>` +
        `<span class="result">${item.userAnswer === item.answer ? "✔" : "✖"}</span>`;
      div.classList.add(
        item.userAnswer === item.answer ? "correct" : "mistake"
      );
      list.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // Переключение режима через кнопки
  const modeButtons = document.querySelectorAll(".mode-btn");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentMode = btn.getAttribute("data-mode");
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      generateQuestion();
    });
  });
  // helper to enable/disable mode buttons while a game is active
  function setModeButtonsDisabled(disabled) {
    modeButtons.forEach((b) => {
      b.disabled = disabled;
      if (disabled) {
        b.classList.add("disabled");
      } else {
        b.classList.remove("disabled");
      }
    });
  }
  // Установить активную кнопку по умолчанию
  document.getElementById("btn-plusminus").classList.add("active");
  // settings & start
  document.getElementById("start-game").addEventListener("click", () => {
    mistakesLimit =
      parseInt(document.getElementById("mistakes-limit").value, 10) || 3;
    correctTarget =
      parseInt(document.getElementById("correct-target").value, 10) || 5;
    // disable settings
    document.querySelector(".settings-container").classList.add("disabled");
    // disable mode selection while game is active
    setModeButtonsDisabled(true);
    gameActive = true;
    correct = 0;
    mistakes = 0;
    history = [];
    updateScore();
    updateHistory();
    generateQuestion();
  });
  updateScore();
  document.getElementById("submit").addEventListener("click", () => {
    if (!gameActive) {
      document.getElementById("feedback").textContent =
        'Сначала нажмите "Начать игру".';
      return;
    }
    const userAnswer = parseInt(document.getElementById("answer").value, 10);
    if (isNaN(userAnswer)) {
      document.getElementById("feedback").textContent =
        "Пожалуйста, введите число.";
      return;
    }
    // Добавляем в историю
    history.push({
      a: window.currentTask.a,
      b: window.currentTask.b,
      op: window.currentTask.op,
      answer: window.currentTask.answer,
      userAnswer,
    });
    if (userAnswer === currentAnswer) {
      correct++;
      document.getElementById("feedback").textContent = "Верно!";
    } else {
      mistakes++;
      document.getElementById("feedback").textContent =
        `Ошибка! Правильный ответ: ${currentAnswer}.`;
    }
    updateScore();
    updateHistory();
    document.getElementById("submit").style.display = "none";
    document.getElementById("next").style.display = "";
    // Check limits
    if (mistakes >= mistakesLimit) {
      // reset counters and restart
      correct = 0;
      mistakes = 0;
      history = [];
      updateScore();
      updateHistory();
      document
        .querySelector(".settings-container")
        .classList.remove("disabled");
      // re-enable mode selection after reset
      setModeButtonsDisabled(false);
      gameActive = false;
      document.getElementById("feedback").textContent =
        "Слишком много ошибок — игра перезапущена. Настройте и начните заново.";
      document.getElementById("submit").style.display = "none";
      document.getElementById("next").style.display = "none";
      return;
    }
    if (correct >= correctTarget) {
      // finish game
      gameActive = false;
      document.getElementById("feedback").textContent =
        `Поздравляем! Вы достигли цели: ${correctTarget} правильных.`;
      // re-enable settings for next run
      document
        .querySelector(".settings-container")
        .classList.remove("disabled");
      // re-enable mode selection after finishing
      setModeButtonsDisabled(false);
      return;
    }
  });
  document.getElementById("next").addEventListener("click", () => {
    if (!gameActive) return;
    generateQuestion();
    updateHistory();
  });
});
