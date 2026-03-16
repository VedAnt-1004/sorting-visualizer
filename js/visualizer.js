// --- js/visualizer.js ---

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Playback State Variables
let isPaused = false;
let currentStep = 0;
let globalAnimations = [];
let initialHTMLSnapshot = ""; // Used to "rewind" instantly
let currentAlgo = "";

// Playback DOM Elements
const playbackControls = document.getElementById('playback-controls');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const algoButtonsGroup = document.querySelector('.algo-buttons-group');

// --- THE MASTER PLAYBACK ENGINE ---
async function runPlaybackEngine() {
    const bars = document.getElementsByClassName('array-bar');
    
    // Hide algorithm buttons, show playback controls
    algoButtonsGroup.classList.add('hidden');
    playbackControls.classList.remove('hidden');

    while (currentStep < globalAnimations.length) {
        // If user hits pause, freeze the loop here
        if (isPaused) {
            await sleep(50);
            continue; 
        }

        // Apply the current visual step
        applyActionToDOM(globalAnimations[currentStep], bars);
        currentStep++;
        
        await sleep(delay);
    }

    // Animation finished
    playbackControls.classList.add('hidden');
    algoButtonsGroup.classList.remove('hidden');
    enableControls();
}

// --- THE DOM MANIPULATOR ---
// --- THE DOM MANIPULATOR ---
function applyActionToDOM(action, bars, isInstant = false) {
    if (!action) return;
    if (action.line !== undefined && !isInstant) highlightLine(action.line);

    // Helper: Convert real numbers into perfect pixel heights dynamically
    const maxVal = Math.max(...array);
    const getScaledHeight = (val) => Math.floor(Math.max((val / maxVal) * 390, 10));

    if (isInstant) {
        if (action.type === 'swap') {
            const val1 = action.heights[0];
            const val2 = action.heights[1];
            
            bars[action.indices[0]].style.height = `${getScaledHeight(val1)}px`;
            bars[action.indices[1]].style.height = `${getScaledHeight(val2)}px`;
            bars[action.indices[0]].innerText = val1;
            bars[action.indices[1]].innerText = val2;
        } else if (action.type === 'overwrite') {
            const val = action.height;
            bars[action.index].style.height = `${getScaledHeight(val)}px`;
            bars[action.index].innerText = val;
        }
        return;
    }

    // --- Standard Playback ---
    if (action.type === 'highlight') {
        // Just code highlight
    } else if (action.type === 'compare') {
        bars[action.indices[0]].style.backgroundColor = 'var(--bar-compare)';
        bars[action.indices[1]].style.backgroundColor = 'var(--bar-compare)';
        document.getElementById('live-comparisons').innerText = parseInt(document.getElementById('live-comparisons').innerText) + 1;
    } else if (action.type === 'swap') {
        const val1 = action.heights[0];
        const val2 = action.heights[1];

        bars[action.indices[0]].style.backgroundColor = 'var(--bar-swap)';
        bars[action.indices[1]].style.backgroundColor = 'var(--bar-swap)';

        // Set dynamic height and perfect text
        bars[action.indices[0]].style.height = `${getScaledHeight(val1)}px`;
        bars[action.indices[1]].style.height = `${getScaledHeight(val2)}px`;
        bars[action.indices[0]].innerText = val1;
        bars[action.indices[1]].innerText = val2;

        document.getElementById('live-swaps').innerText = parseInt(document.getElementById('live-swaps').innerText) + 1;
    } else if (action.type === 'overwrite') {
        const val = action.height;

        bars[action.index].style.backgroundColor = 'var(--bar-swap)';

        // Set dynamic height and perfect text
        bars[action.index].style.height = `${getScaledHeight(val)}px`;
        bars[action.index].innerText = val;

        document.getElementById('live-swaps').innerText = parseInt(document.getElementById('live-swaps').innerText) + 1;
    } else if (action.type === 'revert') {
        bars[action.indices[0]].style.backgroundColor = 'var(--bar-default)';
        bars[action.indices[1]].style.backgroundColor = 'var(--bar-default)';
    } else if (action.type === 'pivot') {
        bars[action.index].style.backgroundColor = '#d946ef';
    } else if (action.type === 'sorted') {
        bars[action.index].style.backgroundColor = 'var(--bar-sorted)';
    }
}

// --- INSTANT REWIND FUNCTION (For "Prev" button) ---
function renderInstantState(targetStep) {
    const container = document.getElementById('visualization-container');
    // 1. Reset the canvas completely
    container.innerHTML = initialHTMLSnapshot;
    const bars = document.getElementsByClassName('array-bar');
    
    // 2. Reset counters
    document.getElementById('live-comparisons').innerText = '0';
    document.getElementById('live-swaps').innerText = '0';
    
    // 3. Fast-forward mathematical changes up to the target step instantly
    for (let i = 0; i < targetStep; i++) {
        applyActionToDOM(globalAnimations[i], bars, true);
        
        // Quietly update counters behind the scenes
        if (globalAnimations[i].type === 'compare') document.getElementById('live-comparisons').innerText = parseInt(document.getElementById('live-comparisons').innerText) + 1;
        if (globalAnimations[i].type === 'swap' || globalAnimations[i].type === 'overwrite') document.getElementById('live-swaps').innerText = parseInt(document.getElementById('live-swaps').innerText) + 1;
    }
    
    // 4. Apply the color of the current target step so the user sees what is happening
    applyActionToDOM(globalAnimations[targetStep], bars, false);
}

// --- MEDIA BUTTON LISTENERS ---
playPauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    playPauseBtn.innerHTML = isPaused ? "▶️ Play" : "⏸ Pause";
    playPauseBtn.classList.toggle('primary');
});

nextBtn.addEventListener('click', () => {
    if (!isPaused || currentStep >= globalAnimations.length) return;
    const bars = document.getElementsByClassName('array-bar');
    applyActionToDOM(globalAnimations[currentStep], bars);
    currentStep++;
});

prevBtn.addEventListener('click', () => {
    if (!isPaused || currentStep <= 0) return;
    currentStep--;
    renderInstantState(currentStep);
});

// --- ALGORITHM INITIALIZERS ---
function initSorting(algoType, getAnimationsFunc) {
    disableControls();
    updateDashboard(algoType);
    renderCode(algoType);
    
    // Save state for the engine
    currentAlgo = algoType;
    currentStep = 0;
    isPaused = false;
    playPauseBtn.innerHTML = "⏸ Pause";
    
    // Take a snapshot of the raw HTML so we can "rewind" back to it
    initialHTMLSnapshot = document.getElementById('visualization-container').innerHTML;
    
    // Generate the script
    globalAnimations = getAnimationsFunc(array.slice());
    
    // Start the engine
    runPlaybackEngine();
}

document.getElementById('bubble-sort-btn').addEventListener('click', () => initSorting('bubble', getBubbleSortAnimations));
document.getElementById('merge-sort-btn').addEventListener('click', () => initSorting('merge', getMergeSortAnimations));
document.getElementById('quick-sort-btn').addEventListener('click', () => initSorting('quick', getQuickSortAnimations));