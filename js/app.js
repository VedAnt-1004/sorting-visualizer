// ==========================================
// MAIN UI MANAGER
// ==========================================

let currentActiveCodes = {}; // Stores code for the currently selected algorithm
let activePlayer = null; // The StepPlayer currently driving the visualizer, if any
let currentAlgoId = null; // Which algorithm the workspace is currently showing
let lastRenderedStep = null; // The most recent step object, used to re-sync code highlight on tab switch

// --- CODE PANEL: line-by-line rendering + active-line sync ---
function renderCodeLines(codeString) {
    const codeS = document.getElementById('code-snippet');
    if (!codeS || typeof codeString !== 'string') return;

    const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    codeS.innerHTML = codeString.split('\n').map((line, idx) => {
        const content = line.length > 0 ? escape(line) : '&nbsp;';
        return `<div class="code-line" data-line="${idx + 1}">${content}</div>`;
    }).join('');
}

function highlightCodeLine(lineNumber) {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-line'));
    const target = document.querySelector(`.code-line[data-line="${lineNumber}"]`);
    if (target) {
        target.classList.add('active-line');
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function clearCodeHighlight() {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-line'));
}

// Called whenever the player moves (Next/Prev/Play tick) AND whenever the code tab changes,
// so the highlighted line always matches the step currently on screen.
function refreshCodeHighlight() {
    const activeTab = document.querySelector('.tab-btn.active');
    const isJsTabActive = activeTab && activeTab.innerText === 'JS';

    if (!lastRenderedStep || !isJsTabActive) {
        clearCodeHighlight();
        return;
    }

    const data = algorithmDatabase[currentAlgoId];
    const line = data && data.lineMap && data.lineMap.javascript && lastRenderedStep.phase
        ? data.lineMap.javascript[lastRenderedStep.phase]
        : null;

    if (line) highlightCodeLine(line);
    else clearCodeHighlight();
}

function onPlayerStep(step) {
    lastRenderedStep = step;
    refreshCodeHighlight();
}

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

    currentAlgoId = algoId;
    lastRenderedStep = null; // fresh workspace, no step to highlight yet

    // Update UI Labels
    const navTitle = document.getElementById('nav-title');
    const desc = document.getElementById('algo-description');
    const timeW = document.getElementById('time-worst');
    const spaceC = document.getElementById('space-complexity');
    
    if (navTitle) navTitle.innerText = data.title;
    if (desc) desc.innerText = data.description;
    if (timeW) timeW.innerText = data.complexities.worst;
    if (spaceC) spaceC.innerText = data.complexities.space;
    
    if (data.code) {
        currentActiveCodes = data.code; 
        renderCodeLines(currentActiveCodes.javascript); // Default to JS
        
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        if(tabs.length > 0) tabs[0].classList.add('active'); 
    }

    // Stop and clear whatever was playing in the previous workspace
    if (activePlayer) {
        activePlayer.pause();
        activePlayer = null;
    }

    // Reset the shared visualizer surface — without this, switching from a
    // Stack/Queue workspace into Search/Sort (or vice versa) would leave a
    // stale stack-mode/queue-mode class or leftover blocks on screen.
    const visualizerContainerEl = document.getElementById('visualizer-container');
    if (visualizerContainerEl) {
        visualizerContainerEl.innerHTML = '';
        visualizerContainerEl.classList.remove('stack-mode', 'queue-mode', 'tree-mode');
    }
    const statusBarEl = document.getElementById('status-bar');
    if (statusBarEl) statusBarEl.className = 'status-message hidden';

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
            lastRenderedStep = null;
            clearCodeHighlight();
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
            'insertion-sort': insertionSortSteps,
            'merge-sort': mergeSortSteps,
            'quick-sort': quickSortSteps
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
            lastRenderedStep = null;
            clearCodeHighlight();
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

    else if (data.type === "stack") {
        // Live/persistent structure — no step player, no playback row.
        stackState = [];

        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="number" id="value-input" class="dashboard-input" placeholder="Value to push">
            </div>

            <div class="control-row center-content">
                <button id="push-btn" class="dashboard-btn btn-blue">Push</button>
                <button id="pop-btn" class="dashboard-btn btn-red">Pop</button>
                <button id="peek-btn" class="dashboard-btn btn-secondary">Peek</button>
                <button id="clear-btn" class="dashboard-btn btn-secondary">Clear</button>
            </div>
        `;

        renderStack(); // show the empty state immediately

        const valueInput = document.getElementById('value-input');
        const readValue = () => {
            const value = parseInt(valueInput.value);
            if (isNaN(value)) {
                alert('Enter a valid number to push.');
                return null;
            }
            return value;
        };

        document.getElementById('push-btn').addEventListener('click', () => {
            const value = readValue();
            if (value === null) return;
            pushToStack(value);
            valueInput.value = '';
        });

        document.getElementById('pop-btn').addEventListener('click', () => {
            popFromStack();
        });

        document.getElementById('peek-btn').addEventListener('click', () => {
            peekStack();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            clearStack();
        });

        // Enter key pushes, same as clicking Push
        valueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('push-btn').click();
        });
    }

    else if (data.type === "queue") {
        queueState = [];

        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="number" id="value-input" class="dashboard-input" placeholder="Value to enqueue">
            </div>

            <div class="control-row center-content">
                <button id="enqueue-btn" class="dashboard-btn btn-blue">Enqueue</button>
                <button id="dequeue-btn" class="dashboard-btn btn-red">Dequeue</button>
                <button id="peek-btn" class="dashboard-btn btn-secondary">Peek</button>
                <button id="clear-btn" class="dashboard-btn btn-secondary">Clear</button>
            </div>
        `;

        renderQueue();

        const valueInput = document.getElementById('value-input');
        const readValue = () => {
            const value = parseInt(valueInput.value);
            if (isNaN(value)) {
                alert('Enter a valid number to enqueue.');
                return null;
            }
            return value;
        };

        document.getElementById('enqueue-btn').addEventListener('click', () => {
            const value = readValue();
            if (value === null) return;
            enqueue(value);
            valueInput.value = '';
        });

        document.getElementById('dequeue-btn').addEventListener('click', () => {
            dequeue();
        });

        document.getElementById('peek-btn').addEventListener('click', () => {
            peekQueue();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            clearQueue();
        });

        valueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('enqueue-btn').click();
        });
    }

    else if (data.type === "tree") {
        treeRoot = null;

        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="number" id="value-input" class="dashboard-input" placeholder="Value">
            </div>

            <div class="control-row center-content">
                <button id="insert-btn" class="dashboard-btn btn-blue">Insert</button>
                <button id="search-btn" class="dashboard-btn btn-secondary">Search</button>
                <button id="random-btn" class="dashboard-btn btn-secondary">Random Tree</button>
                <button id="clear-btn" class="dashboard-btn btn-red">Clear</button>
            </div>
        `;

        renderTree(); // show the empty state immediately

        const valueInput = document.getElementById('value-input');
        const readValue = () => {
            const value = parseInt(valueInput.value);
            if (isNaN(value)) {
                alert('Enter a valid number.');
                return null;
            }
            return value;
        };

        document.getElementById('insert-btn').addEventListener('click', async () => {
            const value = readValue();
            if (value === null) return;
            await insertNode(value);
            valueInput.value = '';
        });

        document.getElementById('search-btn').addEventListener('click', () => {
            const value = readValue();
            if (value === null) return;
            searchTree(value);
        });

        document.getElementById('random-btn').addEventListener('click', async () => {
            clearTree();
            const values = new Set();
            while (values.size < 7) {
                values.add(Math.floor(Math.random() * 90) + 10);
            }
            for (const v of values) {
                await insertNode(v);
            }
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            clearTree();
        });

        valueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('insert-btn').click();
        });
    }
}

// --- 3b. SHARED PLAYBACK HELPERS (used by both search and sorting workspaces) ---

// Creates a fresh StepPlayer from a generator + its args, then auto-plays it —
// matches the original "click Search/Sort and watch it run" behavior. The
// Prev/Play/Next controls let the user pause and step through at any point
// during or after that run; they're not required just to see it happen.
function startPlayer(generatorFn, ...args) {
    if (!generatorFn) return;
    if (activePlayer) activePlayer.pause();

    activePlayer = new StepPlayer(generatorFn, ...args);
    activePlayer.onStep = onPlayerStep;
    activePlayer.play(() => updatePlaybackButtons());
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

    codeTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            codeTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            const selectedLang = e.target.innerText;
            let dataKey = 'javascript'; 
            if (selectedLang === 'Python') dataKey = 'python';
            if (selectedLang === 'C++') dataKey = 'cpp'; 

            if (currentActiveCodes && currentActiveCodes[dataKey]) {
                renderCodeLines(currentActiveCodes[dataKey]);
            }

            // Line-by-line sync only exists for JS right now; re-check and
            // either show or clear the highlight for the newly active tab.
            refreshCodeHighlight();
        });
    });

    // Copy Button
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const codeSnippet = document.getElementById('code-snippet');
            const textToCopy = codeSnippet.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = "✅ Copied!";
                setTimeout(() => copyBtn.innerHTML = originalText, 2000);
            });
        });
    }
});