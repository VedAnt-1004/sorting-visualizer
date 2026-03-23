// ==========================================
// 1. SPA ROUTER & NAVIGATION
// ==========================================
const welcomeScreen = document.getElementById('welcome-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const workspaceScreen = document.getElementById('workspace-screen');

const getStartedBtn = document.getElementById('get-started-btn');
const openSortingBtn = document.getElementById('open-sorting-btn');
const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

/**
 * Switch between screens safely
 */
function navigateTo(targetScreen) {
    const screens = [welcomeScreen, dashboardScreen, workspaceScreen];
    
    screens.forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        }
    });

    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
        console.log("Navigated to:", targetScreen.id);
    }
}

// Attach Navigation Listeners
if (getStartedBtn) getStartedBtn.addEventListener('click', () => navigateTo(dashboardScreen));
if (backToDashboardBtn) backToDashboardBtn.addEventListener('click', () => navigateTo(dashboardScreen));
if (openSortingBtn) {
    openSortingBtn.addEventListener('click', () => {
        navigateTo(workspaceScreen);
        // Initialize an array if the workspace is empty
        if (typeof generateArray === 'function') generateArray();
    });
}

// ==========================================
// 2. SORTING CONTROLS (Safety Shielded)
// ==========================================
const sortBtn = document.getElementById('sort-btn');
const newArrayBtn = document.getElementById('new-array-btn');
const sizeSlider = document.getElementById('size-slider');
const speedSlider = document.getElementById('speed-slider');
const algoSelect = document.getElementById('algo-select');

// These 'if' checks prevent the "null" crash on page load
if (sortBtn) {
    sortBtn.addEventListener('click', () => {
        const selectedAlgo = algoSelect ? algoSelect.value : 'bubble';
        if (selectedAlgo === 'bubble') bubbleSort();
        if (selectedAlgo === 'merge') mergeSort();
        if (selectedAlgo === 'quick') quickSort();
    });
}

if (newArrayBtn) newArrayBtn.addEventListener('click', () => {
    if (typeof generateArray === 'function') generateArray();
});

// ==========================================
// 3. DATA & CONFIGURATION
// ==========================================
let array = [];
let delay = 50;

if (speedSlider) {
    speedSlider.addEventListener('input', () => {
        delay = 101 - speedSlider.value; // Invert so higher value = faster
    });
}

const complexityData = {
    bubble: { time: "O(n²)", space: "O(1)" },
    merge: { time: "O(n log n)", space: "O(n)" },
    quick: { time: "O(n log n)", space: "O(log n)" }
};

// ==========================================
// 4. CORE UTILITIES
// ==========================================
function updateComplexity(algo) {
    const timeDisplay = document.getElementById('time-complexity');
    const spaceDisplay = document.getElementById('space-complexity');
    if (timeDisplay && spaceDisplay) {
        timeDisplay.innerText = complexityData[algo].time;
        spaceDisplay.innerText = complexityData[algo].space;
    }
}

/**
 * Simple sleep function for animations
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 5. ALGORITHMS (Placeholder Logic)
// Note: Ensure your real logic in algorithms.js uses the 'array' and 'delay' variables
// ==========================================
async function bubbleSort() {
    console.log("Bubble Sort Started");
    // Your specific visualizer logic goes here or in algorithms.js
}

async function mergeSort() {
    console.log("Merge Sort Started");
}

async function quickSort() {
    console.log("Quick Sort Started");
}

console.log("AlgoVision app.js loaded successfully!");