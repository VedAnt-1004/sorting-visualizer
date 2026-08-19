// ==========================================
// MAIN UI MANAGER
// ==========================================

let currentActiveCodes = {}; // Stores code for the currently selected algorithm
let activePlayer = null; // The StepPlayer currently driving the visualizer, if any

// --- 1. SCREEN NAVIGATION ENGINE ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

// --- 2. DYNAMIC DASHBOARD BUILDER (Option 3 Fix) ---
// This function clears the dashboard and rebuilds cards from data.js
function buildDashboard(categoryId) {
    const dashboardContainer = document.querySelector('.dashboard-container');
    const stageHeader = document.querySelector('.dashboard-stage .dashboard-header h2');
    
    // 1. Clear current content
    dashboardContainer.innerHTML = '';
    
    // 2. Set dynamic header based on sidebar choice
    if(stageHeader) {
        stageHeader.innerText = `Workspace: ${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}`;
    }

    // 3. Find algorithms matching the category (e.g., 'array', 'stack')
    const relevantAlgos = [];
    for (const key in algorithmDatabase) {
        if (algorithmDatabase[key].category === categoryId) {
            relevantAlgos.push(algorithmDatabase[key]);
        }
    }

    if (relevantAlgos.length === 0) {
        dashboardContainer.innerHTML = '<div class="coming-soon-panel"><h2>Working on this! More modules arriving soon.</h2><p>Linear Search and Binary Search (Array -> Searching) are active.</p></div>';
        return;
    }

    // 4. Group relevant algos by their sub-type (e.g., 'Searching', 'Sorting')
    const grouped = {};
    relevantAlgos.forEach(algo => {
        if (!grouped[algo.type]) grouped[algo.type] = [];
        grouped[algo.type].push(algo);
    });

    // 5. Generate the HTML Bento Structure
    for (const type in grouped) {
        // Create the ds-category wrapper
        const categoryWrapper = document.createElement('div');
        categoryWrapper.classList.add('ds-category');

        // Capitalize type name (searching -> Searching)
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        
        categoryWrapper.innerHTML = `<h3>${capitalizedType} <span class="header-i-icon">ⓘ</span></h3>`;

        // Create the card-grid
        const cardGrid = document.createElement('div');
        cardGrid.classList.add('card-grid');

        // Create the individual algo-cards
        grouped[type].forEach(algo => {
            const cardId = algo.id || Object.keys(algorithmDatabase).find(key => algorithmDatabase[key] === algo);
            const card = document.createElement('button');
            card.classList.add('algo-card');
            card.setAttribute('data-target', cardId);
            card.innerHTML = `${algo.title} <span class="arrow">›</span>`;
            
            // Add click listener to the newly created card
            card.addEventListener('click', () => {
                const algoId = card.getAttribute('data-target');
                if (algoId && algorithmDatabase[algoId]) {
                    buildWorkspace(algoId);
                    showScreen('workspace-screen');
                    window.scrollTo(0, 0);
                }
            });

            cardGrid.appendChild(card);
        });

        categoryWrapper.appendChild(cardGrid);
        dashboardContainer.appendChild(categoryWrapper);
    }
}

// --- 3. WORKSPACE BUILDER (Unchanged) ---
function buildWorkspace(algoId) {
    const data = algorithmDatabase[algoId];
    
    if (!data) {
        console.error("Algorithm not found in database:", algoId);
        return;
    }

    // Update UI Labels
    const navTitle = document.getElementById('nav-title');
    const desc = document.getElementById('algo-description');
    const timeW = document.getElementById('time-worst');
    const spaceC = document.getElementById('space-complexity');
    const codeS = document.getElementById('code-snippet');
    
    if (navTitle) navTitle.innerText = data.title;
    if (desc) desc.innerText = data.description;
    if (timeW) timeW.innerText = data.complexities.worst;
    if (spaceC) spaceC.innerText = data.complexities.space;
    
    if (data.code) {
        currentActiveCodes = data.code; 
        if (codeS) codeS.innerText = currentActiveCodes.javascript; // Default to JS
        
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        if(tabs.length > 0) tabs[0].classList.add('active'); 
    }

    // Stop and clear whatever was playing in the previous workspace
    if (activePlayer) {
        activePlayer.pause();
        activePlayer = null;
    }

    // Build the Control Panel
    const controlsZone = document.getElementById('dynamic-controls');

    const playbackControlsHTML = `
            <div class="control-row center-content playback-row">
                <button id="prev-btn" class="dashboard-btn btn-secondary" disabled>◀ Prev</button>
                <button id="play-btn" class="dashboard-btn btn-blue" disabled>▶ Play</button>
                <button id="next-btn" class="dashboard-btn btn-secondary" disabled>Next ▶</button>
            </div>`;

    if (data.type === "search") {
        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="text" id="array-input" class="dashboard-input wireframe-array-input" placeholder="e.g. 3, 1, 4, 1, 5">
                <input type="number" id="target-input" class="dashboard-input wireframe-target-input" placeholder="Target">
            </div>

            <div class="control-row center-content speed-row">
                <label class="speed-label" for="speed-slider">Speed</label>
                <input type="range" id="speed-slider" min="100" max="1000" step="50" value="500">
            </div>
            
            <div class="control-row center-content">
                <button id="random-btn" class="dashboard-btn btn-secondary">Random</button>
                <button id="action-btn" class="dashboard-btn btn-blue wireframe-search-btn">Search</button>
                <button id="reset-btn" class="dashboard-btn btn-red">Reset</button>
            </div>
            ${playbackControlsHTML}
        `;

        document.getElementById('random-btn').addEventListener('click', () => {
            let randomArr = Array.from({length: 7}, () => Math.floor(Math.random() * 99) + 1);
            if (algoId === 'binary-search') randomArr.sort((a, b) => a - b);
            document.getElementById('array-input').value = randomArr.join(', ');
            document.getElementById('target-input').value = randomArr[Math.floor(Math.random() * randomArr.length)];
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            document.getElementById('array-input').value = '';
            document.getElementById('target-input').value = '';
            document.getElementById('visualizer-container').innerHTML = '';
            document.getElementById('status-bar').className = 'status-message hidden';
            if (activePlayer) { activePlayer.pause(); activePlayer = null; }
            updatePlaybackButtons();
        });

        document.getElementById('speed-slider').addEventListener('input', (e) => {
            setSpeed(1100 - parseInt(e.target.value));
        });

        document.getElementById('action-btn').addEventListener('click', () => {
            const arrayInput = document.getElementById('array-input').value;
            const targetInput = document.getElementById('target-input').value;

            let arr = arrayInput.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
            const target = parseInt(targetInput);

            if (arr.length === 0 || isNaN(target)) {
                alert("Please enter valid numbers.");
                return;
            }

            if (algoId === 'binary-search') {
                arr.sort((a, b) => a - b);
                document.getElementById('array-input').value = arr.join(', ');
            }

            const generators = { 'linear-search': linearSearchSteps, 'binary-search': binarySearchSteps };
            startPlayer(generators[algoId], arr, target);
        });

        setupPlaybackButtons();
    }

    else if (data.type === "sorting") {
        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="text" id="array-input" class="dashboard-input wireframe-array-input" placeholder="e.g. 5, 3, 8, 1, 9">
            </div>

            <div class="control-row center-content speed-row">
                <label class="speed-label" for="speed-slider">Speed</label>
                <input type="range" id="speed-slider" min="100" max="1000" step="50" value="500">
            </div>

            <div class="control-row center-content">
                <button id="random-btn" class="dashboard-btn btn-secondary">Random</button>
                <button id="action-btn" class="dashboard-btn btn-blue">Sort</button>
                <button id="reset-btn" class="dashboard-btn btn-red">Reset</button>
            </div>
            ${playbackControlsHTML}
        `;

        const generators = {
            'bubble-sort': bubbleSortSteps,
            'selection-sort': selectionSortSteps,
            'insertion-sort': insertionSortSteps
        };

        document.getElementById('random-btn').addEventListener('click', () => {
            let randomArr = Array.from({length: 8}, () => Math.floor(Math.random() * 99) + 1);
            document.getElementById('array-input').value = randomArr.join(', ');
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            document.getElementById('array-input').value = '';
            document.getElementById('visualizer-container').innerHTML = '';
            document.getElementById('status-bar').className = 'status-message hidden';
            if (activePlayer) { activePlayer.pause(); activePlayer = null; }
            updatePlaybackButtons();
        });

        document.getElementById('speed-slider').addEventListener('input', (e) => {
            setSpeed(1100 - parseInt(e.target.value));
        });

        document.getElementById('action-btn').addEventListener('click', () => {
            const arrayInput = document.getElementById('array-input').value;
            let arr = arrayInput.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));

            if (arr.length === 0) {
                alert("Please enter valid numbers.");
                return;
            }

            startPlayer(generators[algoId], arr);
        });

        setupPlaybackButtons();
    }
}

// --- 3b. SHARED PLAYBACK HELPERS (used by both search and sorting workspaces) ---

// Creates a fresh StepPlayer from a generator + its args, shows the first step immediately.
function startPlayer(generatorFn, ...args) {
    if (!generatorFn) return;
    if (activePlayer) activePlayer.pause();

    activePlayer = new StepPlayer(generatorFn, ...args);
    activePlayer.next(); // render the initial "Starting..." step right away
    updatePlaybackButtons();
}

// Enables/disables Prev/Next/Play based on the player's current position.
function updatePlaybackButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const playBtn = document.getElementById('play-btn');
    const nextBtn = document.getElementById('next-btn');
    if (!prevBtn || !playBtn || !nextBtn) return;

    const hasPlayer = !!activePlayer;
    prevBtn.disabled = !hasPlayer || activePlayer.isAtStart();
    nextBtn.disabled = !hasPlayer || activePlayer.isAtEnd();
    playBtn.disabled = !hasPlayer || activePlayer.isAtEnd();
    playBtn.innerText = hasPlayer && activePlayer.playing ? '⏸ Pause' : '▶ Play';
}

// Wires the Prev/Play/Next buttons once per workspace build (buttons are recreated each time).
function setupPlaybackButtons() {
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (!activePlayer) return;
        activePlayer.pause();
        activePlayer.prev();
        updatePlaybackButtons();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (!activePlayer) return;
        activePlayer.pause();
        activePlayer.next();
        updatePlaybackButtons();
    });

    document.getElementById('play-btn').addEventListener('click', () => {
        if (!activePlayer) return;
        if (activePlayer.playing) {
            activePlayer.pause();
            updatePlaybackButtons();
        } else {
            activePlayer.play(() => updatePlaybackButtons());
            updatePlaybackButtons();
        }
    });
}

// --- 4. EVENT LISTENERS (ON LOAD) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Welcome Screen -> Dashboard
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            showScreen('dashboard-screen');
            buildDashboard('array'); // Automatically load the first category
        });
    }

    // Sidebar Category Clicks (Option 3 Logic)
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active from all, add to clicked
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Build the new stage
            const categoryId = e.currentTarget.getAttribute('data-target');
            if (categoryId) {
                buildDashboard(categoryId);
            }
        });
    });

    // Home Logo -> Back to Dashboard (Default state)
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            showScreen('dashboard-screen');
            buildDashboard('array');
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            document.querySelector('.sidebar-nav li[data-target="array"]').classList.add('active');
        });
    }

    // Code Panel Tabs
    const codeTabs = document.querySelectorAll('.tab-btn');
    const codeSnippet = document.getElementById('code-snippet');

    codeTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            codeTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            const selectedLang = e.target.innerText;
            let dataKey = 'javascript'; 
            if (selectedLang === 'Python') dataKey = 'python';
            if (selectedLang === 'C++') dataKey = 'cpp'; 

            if (currentActiveCodes && currentActiveCodes[dataKey]) {
                codeSnippet.innerText = currentActiveCodes[dataKey];
            }
        });
    });

    // Copy Button
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = codeSnippet.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = "✅ Copied!";
                setTimeout(() => copyBtn.innerHTML = originalText, 2000);
            });
        });
    }
});