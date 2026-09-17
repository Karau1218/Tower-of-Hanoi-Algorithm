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

initPython();

function getCanvasContext() {
  const canvas = document.getElementById("hanoiCanvas");
  return { canvas, ctx: canvas.getContext("2d") };
}

function drawState(state, totalDisks) {
  const { canvas, ctx } = getCanvasContext();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const baseWidth = 540;
  const baseY = 240;
  const rodWidth = 8;
  const rodHeight = 150;
  const pegX = [120, 300, 480];

  // Draw Base
  ctx.fillStyle = "#64748b";
  ctx.fillRect((canvas.width - baseWidth) / 2, baseY, baseWidth, 12);

  // Draw 3 Rods (A, B, C)
  ctx.fillStyle = "#94a3b8";
  pegX.forEach((x, index) => {
    ctx.fillRect(x - rodWidth / 2, baseY - rodHeight, rodWidth, rodHeight);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(["A", "B", "C"][index], x, baseY + 26);
    ctx.fillStyle = "#94a3b8";
  });

  // Draw Disks
  const maxDiskWidth = 140;
  const minDiskWidth = 36;
  const diskHeight = Math.min(20, Math.floor(120 / Math.max(totalDisks, 1)));

  state.forEach((rod, pegIdx) => {
    rod.forEach((diskVal, diskIdx) => {
      const diskW = minDiskWidth + (diskVal - 1) * ((maxDiskWidth - minDiskWidth) / Math.max(totalDisks - 1, 1));
      const x = pegX[pegIdx] - diskW / 2;
      const y = baseY - (diskIdx + 1) * (diskHeight + 2);

      ctx.fillStyle = diskColors[(diskVal - 1) % diskColors.length];
      ctx.beginPath();
      ctx.roundRect(x, y, diskW, diskHeight, 4);
      ctx.fill();

      // Disk Number
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(diskVal, pegX[pegIdx], y + diskHeight / 2);
    });
  });
}

async function runSolver() {
  if (!pyodideInstance) return;
  stopAnimation();

  const n = parseInt(document.getElementById("diskCount").value, 10);
  if (isNaN(n) || n < 1 || n > 8) return;

  // Run curriculum string output
  const rawLog = await pyodideInstance.runPythonAsync(`hanoi_solver(${n})`);
  document.getElementById("outputLog").innerText = rawLog;

  // Get structural snapshots for animation
  const stepsJson = await pyodideInstance.runPythonAsync(`get_hanoi_steps(${n})`);
  animationSteps = JSON.parse(stepsJson);

  document.getElementById("totalMoves").innerText = animationSteps.length - 1;
  document.getElementById("currentMove").innerText = "0";

  currentStepIndex = 0;
  isPaused = false;
  document.getElementById("pauseBtn").disabled = false;
  document.getElementById("pauseBtn").innerText = "Pause";

  stepLoop(n);
}

function stepLoop(totalDisks) {
  if (currentStepIndex >= animationSteps.length) {
    document.getElementById("pauseBtn").disabled = true;
    return;
  }

  drawState(animationSteps[currentStepIndex], totalDisks);
  document.getElementById("currentMove").innerText = currentStepIndex;

  const speed = 1050 - parseInt(document.getElementById("speedSlider").value, 10);

  animationTimer = setTimeout(() => {
    if (!isPaused) {
      currentStepIndex++;
      stepLoop(totalDisks);
    }
  }, speed);
}