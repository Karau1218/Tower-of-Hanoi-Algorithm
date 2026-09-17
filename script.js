let pyodideInstance = null;
let animationSteps = [];
let currentStepIndex = 0;
let isPaused = false;
let animationTimer = null;

const diskColors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"
];

async function initPython() {
  const statusEl = document.getElementById("status");
  try {
    statusEl.innerText = "Loading Pyodide runtime...";
    pyodideInstance = await loadPyodide();

    const response = await fetch("main.py");
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const code = await response.text();
    await pyodideInstance.runPythonAsync(code);

    statusEl.innerText = "Python solver ready.";
    statusEl.style.color = "#4ade80";

    resetVisualizer();
  } catch (err) {
    statusEl.innerText = "Error: " + err.message;
    statusEl.style.color = "#f87171";
    console.error(err);
  }
}