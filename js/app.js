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
// so the highlighted line always matches the step currently on screen — for
// whichever language tab (JS/Python/C++) happens to be active.
function refreshCodeHighlight() {
    const activeTab = document.querySelector('.tab-btn.active');
    const langKeyByLabel = { 'JS': 'javascript', 'Python': 'python', 'C++': 'cpp' };
    const activeLangKey = activeTab ? langKeyByLabel[activeTab.innerText] : null;

    if (!lastRenderedStep || !activeLangKey) {
        clearCodeHighlight();
        return;
    }

    const data = algorithmDatabase[currentAlgoId];
    const line = data && data.lineMap && data.lineMap[activeLangKey] && lastRenderedStep.phase
        ? data.lineMap[activeLangKey][lastRenderedStep.phase]
        : null;

    if (line) highlightCodeLine(line);
    else clearCodeHighlight();
}

function onPlayerStep(step) {
    lastRenderedStep = step;
    refreshCodeHighlight();
    updateTelemetry();
    syncScrubber();
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

// --- Big-O plain-English lookup (spec §5.2 — interactive complexity hover legend) ---
const BIG_O_EXPLANATIONS = {
    'O(1)': 'Constant time — same speed no matter how much data there is.',
    'O(log n)': 'Grows very slowly — cuts the problem in half each step.',
    'O(n)': 'Grows proportionally with the amount of data.',
    'O(n log n)': 'Grows fast but stays manageable at scale.',
    'O(n²)': 'Grows quickly — can get slow on large inputs.',
    'O(V + E)': 'Scales with the number of nodes and connections in the graph.'
};

function getComplexityExplanation(bigO) {
    return BIG_O_EXPLANATIONS[bigO] || 'Describes how runtime grows as input size increases.';
}

// A card is "Algorithm mode" (StepPlayer-driven run) if its type is search/sorting;
// everything else (stack/queue/tree/graph) is "Structure mode" (live, no timeline).
function getCardMode(algoType) {
    return (algoType === 'search' || algoType === 'sorting') ? 'algorithm' : 'structure';
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

    // 4b. Filter tabs (spec: top category filter pills) — only worth rendering when
    // this category actually has more than one sub-type to switch between (e.g.
    // Array has Searching + Sorting; Stack/Queue/Tree/Graph each have just one,
    // where a filter row would be pure clutter with nothing to filter).
    const groupTypes = Object.keys(grouped);
    if (groupTypes.length > 1) {
        const filterRow = document.createElement('div');
        filterRow.classList.add('filter-tabs');

        const allPill = document.createElement('button');
        allPill.type = 'button';
        allPill.classList.add('filter-pill', 'active');
        allPill.textContent = 'All';
        allPill.dataset.filter = 'all';
        filterRow.appendChild(allPill);

        groupTypes.forEach(type => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.classList.add('filter-pill');
            pill.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            pill.dataset.filter = type;
            filterRow.appendChild(pill);
        });

        filterRow.addEventListener('click', (e) => {
            const pill = e.target.closest('.filter-pill');
            if (!pill) return;
            filterRow.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.dataset.filter;
            dashboardContainer.querySelectorAll('.ds-category').forEach(section => {
                section.style.display = (filter === 'all' || section.dataset.type === filter) ? '' : 'none';
            });
        });

        dashboardContainer.appendChild(filterRow);
    }

    // 5. Generate the HTML Bento Structure
    for (const type in grouped) {
        // Create the ds-category wrapper
        const categoryWrapper = document.createElement('div');
        categoryWrapper.classList.add('ds-category');
        categoryWrapper.dataset.type = type; // used by the filter tabs above

        // Capitalize type name (searching -> Searching)
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        
        categoryWrapper.innerHTML = `<h3>${capitalizedType} <span class="header-i-icon">ⓘ</span></h3>`;

        // Create the card-grid
        const cardGrid = document.createElement('div');
        cardGrid.classList.add('card-grid');

        // Create the individual algo-cards
        grouped[type].forEach(algo => {
            const cardId = algo.id || Object.keys(algorithmDatabase).find(key => algorithmDatabase[key] === algo);
            const mode = getCardMode(algo.type);
            const modeLabel = mode === 'algorithm' ? '▶ Algorithm' : '⚡ Structure';
            const worstComplexity = algo.complexities ? algo.complexities.worst : '';
            const explanation = getComplexityExplanation(worstComplexity);

            // Card is a div[role=button], NOT a real <button> — the complexity tag
            // inside it is itself a separate focusable/hoverable element, and a
            // focusable descendant nested inside a real <button> is invalid HTML
            // and breaks screen-reader semantics. div[role=button] + explicit
            // click/keydown handling keeps full keyboard operability without that
            // nesting violation.
            const card = document.createElement('div');
            card.classList.add('algo-card', `algo-card-${categoryId}`);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Open ${algo.title} workspace`);

            card.innerHTML = `
                <div class="algo-card-top">
                    <span class="algo-card-title">${algo.title}</span>
                    <span class="arrow">›</span>
                </div>
                <div class="algo-card-tags">
                    <span class="mode-badge">${modeLabel}</span>
                    ${worstComplexity ? `
                    <span class="complexity-tag" tabindex="0" aria-label="${worstComplexity} time complexity: ${explanation}">
                        ${worstComplexity}
                        <span class="complexity-tooltip" role="tooltip">${explanation}</span>
                    </span>` : ''}
                </div>
            `;

            // Add click + keyboard activation to open the workspace
            const openWorkspace = () => {
                if (cardId && algorithmDatabase[cardId]) {
                    buildWorkspace(cardId);
                    showScreen('workspace-screen');
                    window.scrollTo(0, 0);
                }
            };
            card.addEventListener('click', openWorkspace);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openWorkspace();
                }
            });

            // Stop the complexity tag's own focus/click from also triggering
            // card navigation — tapping/clicking it should just reveal the
            // tooltip, not immediately jump into the workspace.
            const complexityTag = card.querySelector('.complexity-tag');
            if (complexityTag) {
                complexityTag.addEventListener('click', (e) => e.stopPropagation());
                complexityTag.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
                });
            }

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
        visualizerContainerEl.classList.remove('stack-mode', 'queue-mode', 'tree-mode', 'graph-mode');
    }
    const statusBarEl = document.getElementById('status-bar');
    if (statusBarEl) statusBarEl.className = 'status-message hidden';

    // Telemetry HUD only applies to Algorithm-mode (StepPlayer-driven) runs —
    // Structure-mode (stack/queue/tree/graph) has no step sequence to track
    // comparisons/swaps against, so it's hidden there (Phase 5 gives
    // Structure mode its own dock instead).
    const isAlgorithmMode = (data.type === 'search' || data.type === 'sorting');
    const telemetryHud = document.getElementById('telemetry-hud');
    if (telemetryHud) telemetryHud.classList.toggle('hidden', !isAlgorithmMode);
    updateTelemetry(); // no activePlayer yet at this point, so this resets to defaults
    syncScrubber();
    resetSessionHistory();

    // Close the theory drawer if it was left open from a previous workspace
    const theoryDrawerEl = document.getElementById('theory-drawer');
    const theoryScrimEl = document.getElementById('theory-scrim');
    const theoryToggleBtnEl = document.getElementById('theory-toggle-btn');
    if (theoryDrawerEl) {
        theoryDrawerEl.classList.add('hidden');
        theoryDrawerEl.setAttribute('aria-hidden', 'true');
    }
    if (theoryScrimEl) theoryScrimEl.classList.add('hidden');
    if (theoryToggleBtnEl) theoryToggleBtnEl.setAttribute('aria-expanded', 'false');

    // Build the Control Panel
    const controlsZone = document.getElementById('dynamic-controls');

    const playbackControlsHTML = `
            <div class="control-row center-content playback-row">
                <button id="prev-btn" class="dashboard-btn btn-secondary" disabled>◀ Prev</button>
                <button id="play-btn" class="dashboard-btn btn-blue" disabled>▶ Play</button>
                <button id="next-btn" class="dashboard-btn btn-secondary" disabled>Next ▶</button>
            </div>
            <div class="control-row center-content scrubber-row">
                <label class="speed-label" for="step-scrubber">Timeline</label>
                <input type="range" id="step-scrubber" min="0" max="0" value="0" step="1" disabled>
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
            logSessionAction(`Pushed ${value}`);
            valueInput.value = '';
        });

        document.getElementById('pop-btn').addEventListener('click', () => {
            const poppedValue = stackState[stackState.length - 1];
            popFromStack();
            if (poppedValue !== undefined) logSessionAction(`Popped ${poppedValue}`);
        });

        document.getElementById('peek-btn').addEventListener('click', () => {
            peekStack();
            if (stackState.length > 0) logSessionAction(`Peeked ${stackState[stackState.length - 1]}`);
        });

        wireClearConfirm(document.getElementById('clear-btn'), () => {
            clearStack();
            logSessionAction('Cleared stack');
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
            logSessionAction(`Enqueued ${value}`);
            valueInput.value = '';
        });

        document.getElementById('dequeue-btn').addEventListener('click', () => {
            const dequeuedValue = queueState[0];
            dequeue();
            if (dequeuedValue !== undefined) logSessionAction(`Dequeued ${dequeuedValue}`);
        });

        document.getElementById('peek-btn').addEventListener('click', () => {
            peekQueue();
            if (queueState.length > 0) logSessionAction(`Peeked ${queueState[0]}`);
        });

        wireClearConfirm(document.getElementById('clear-btn'), () => {
            clearQueue();
            logSessionAction('Cleared queue');
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
                <button id="delete-btn" class="dashboard-btn btn-red">Delete</button>
                <button id="random-btn" class="dashboard-btn btn-secondary">Random Tree</button>
                <button id="clear-btn" class="dashboard-btn btn-red">Clear</button>
            </div>

            <div class="control-row center-content traversal-row">
                <button id="inorder-btn" class="dashboard-btn btn-secondary">In-Order</button>
                <button id="preorder-btn" class="dashboard-btn btn-secondary">Pre-Order</button>
                <button id="postorder-btn" class="dashboard-btn btn-secondary">Post-Order</button>
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
            logSessionAction(`Inserted ${value}`);
            valueInput.value = '';
        });

        document.getElementById('search-btn').addEventListener('click', () => {
            const value = readValue();
            if (value === null) return;
            searchTree(value);
            logSessionAction(`Searched ${value}`);
        });

        document.getElementById('delete-btn').addEventListener('click', () => {
            const value = readValue();
            if (value === null) return;
            deleteNode(value);
            logSessionAction(`Deleted ${value}`);
            valueInput.value = '';
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
            logSessionAction('Generated random tree');
        });

        wireClearConfirm(document.getElementById('clear-btn'), () => {
            clearTree();
            logSessionAction('Cleared tree');
        });

        document.getElementById('inorder-btn').addEventListener('click', () => {
            runTraversal('inorder');
            logSessionAction('In-Order traversal');
        });

        document.getElementById('preorder-btn').addEventListener('click', () => {
            runTraversal('preorder');
            logSessionAction('Pre-Order traversal');
        });

        document.getElementById('postorder-btn').addEventListener('click', () => {
            runTraversal('postorder');
            logSessionAction('Post-Order traversal');
        });

        valueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('insert-btn').click();
        });
    }

    else if (data.type === "graph") {
        graphNodes = {};
        graphEdges = [];

        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="text" id="node-input" class="dashboard-input" placeholder="Node (e.g. A)" maxlength="3">
                <button id="add-node-btn" class="dashboard-btn btn-blue">Add Node</button>
            </div>

            <div class="control-row controls-top-row">
                <input type="text" id="edge-from-input" class="dashboard-input" placeholder="From" maxlength="3">
                <input type="text" id="edge-to-input" class="dashboard-input" placeholder="To" maxlength="3">
                <button id="add-edge-btn" class="dashboard-btn btn-blue">Add Edge</button>
            </div>

            <div class="control-row controls-top-row">
                <input type="text" id="start-node-input" class="dashboard-input" placeholder="Start node" maxlength="3">
                <button id="bfs-btn" class="dashboard-btn btn-secondary">BFS</button>
                <button id="dfs-btn" class="dashboard-btn btn-secondary">DFS</button>
            </div>

            <div class="control-row center-content">
                <button id="random-btn" class="dashboard-btn btn-secondary">Random Graph</button>
                <button id="clear-btn" class="dashboard-btn btn-red">Clear</button>
            </div>
        `;

        renderGraph(); // show the empty state immediately

        document.getElementById('add-node-btn').addEventListener('click', () => {
            const input = document.getElementById('node-input');
            const id = input.value.trim();
            const statusBar = document.getElementById('status-bar');
            if (!id) { alert('Enter a node label.'); return; }

            if (addNode(id)) {
                statusBar.className = 'status-message success';
                statusBar.innerText = `Added node ${id}`;
            } else {
                statusBar.className = 'status-message error';
                statusBar.innerText = `Node ${id} already exists`;
            }
            input.value = '';
        });

        document.getElementById('add-edge-btn').addEventListener('click', () => {
            const fromInput = document.getElementById('edge-from-input');
            const toInput = document.getElementById('edge-to-input');
            const u = fromInput.value.trim();
            const v = toInput.value.trim();
            const statusBar = document.getElementById('status-bar');
            if (!u || !v) { alert('Enter both node labels.'); return; }

            if (addEdge(u, v)) {
                statusBar.className = 'status-message success';
                statusBar.innerText = `Added edge ${u} — ${v}`;
            } else {
                statusBar.className = 'status-message error';
                statusBar.innerText = `Couldn't add that edge (missing node, duplicate, or self-loop)`;
            }
            fromInput.value = '';
            toInput.value = '';
        });

        document.getElementById('bfs-btn').addEventListener('click', () => {
            const start = document.getElementById('start-node-input').value.trim();
            if (!start) { alert('Enter a start node.'); return; }
            bfsTraversal(start);
        });

        document.getElementById('dfs-btn').addEventListener('click', () => {
            const start = document.getElementById('start-node-input').value.trim();
            if (!start) { alert('Enter a start node.'); return; }
            dfsTraversal(start);
        });

        document.getElementById('random-btn').addEventListener('click', () => {
            generateRandomGraph();
        });

        wireClearConfirm(document.getElementById('clear-btn'), () => {
            clearGraph();
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

// --- Telemetry HUD (spec: Comparisons / Swaps / Current Index) ---
// Derived from the player's step cache rather than a separate running
// counter, so Prev/scrubbing backward shows historically-accurate counts
// for wherever the player currently is — not just "highest reached so far".
function updateTelemetry() {
    const comparisonsEl = document.getElementById('telemetry-comparisons');
    const swapsEl = document.getElementById('telemetry-swaps');
    const indicesEl = document.getElementById('telemetry-indices');
    if (!comparisonsEl || !swapsEl || !indicesEl) return;

    if (!activePlayer) {
        comparisonsEl.innerText = '0';
        swapsEl.innerText = '0';
        indicesEl.innerText = '—';
        return;
    }

    const stepsSoFar = activePlayer.cache.slice(0, activePlayer.pointer + 1);
    const comparisonPhases = ['compare', 'checking', 'compare-shift'];
    const comparisons = stepsSoFar.filter(s => comparisonPhases.includes(s.phase)).length;
    const swaps = stepsSoFar.filter(s => s.phase === 'swap').length;

    const last = stepsSoFar[stepsSoFar.length - 1];
    let indicesText = '—';
    if (last && last.highlights) {
        const idxs = [...(last.highlights.current || []), ...(last.highlights.comparing || [])];
        if (idxs.length) {
            indicesText = idxs.join(', ');
        } else if (last.highlights.found !== undefined && last.highlights.found !== null) {
            indicesText = String(last.highlights.found);
        }
    }

    comparisonsEl.innerText = String(comparisons);
    swapsEl.innerText = String(swaps);
    indicesEl.innerText = indicesText;
}

// --- Timeline scrubber sync ---
// Grows its max as the run progresses (the generator is lazy, so the total
// step count isn't known until the run finishes) and reflects the player's
// current pointer position.
function syncScrubber() {
    const scrubber = document.getElementById('step-scrubber');
    if (!scrubber) return;
    if (!activePlayer) {
        scrubber.disabled = true;
        scrubber.max = 0;
        scrubber.value = 0;
        return;
    }
    scrubber.disabled = false;
    scrubber.max = Math.max(activePlayer.cache.length - 1, 0);
    scrubber.value = activePlayer.pointer;
}

// Enables/disables Prev/Next/Play based on the player's current position.
function updatePlaybackButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const playBtn = document.getElementById('play-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn && playBtn && nextBtn) {
        const hasPlayer = !!activePlayer;
        prevBtn.disabled = !hasPlayer || activePlayer.isAtStart();
        nextBtn.disabled = !hasPlayer || activePlayer.isAtEnd();
        playBtn.disabled = !hasPlayer || activePlayer.isAtEnd();
        playBtn.innerText = hasPlayer && activePlayer.playing ? '⏸ Pause' : '▶ Play';
    }

    // Folded in here too (not just onPlayerStep) so every call site that
    // already calls updatePlaybackButtons — Reset, manual Prev/Next, etc —
    // gets telemetry/scrubber sync for free without touching those call sites.
    updateTelemetry();
    syncScrubber();
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

    // Timeline scrubber (spec §2.1) — dragging seeks the player directly to
    // that step index and pauses any active autoplay.
    const scrubber = document.getElementById('step-scrubber');
    if (scrubber) {
        scrubber.addEventListener('input', () => {
            if (!activePlayer) return;
            activePlayer.pause();
            activePlayer.seekTo(parseInt(scrubber.value, 10));
            updatePlaybackButtons();
        });
    }
}

// --- 3c. STRUCTURE MODE DOCK HELPERS (Stack/Queue/Tree — spec §2.2) ---

// Clear is destructive, so the first click swaps the button to "Confirm?"
// instead of clearing immediately; a second click (within 3s) actually
// clears. No modal — just an inline label swap — so this can't break the
// zero-scroll layout. Clicking elsewhere doesn't cancel it (no outside-click
// listener), but it auto-reverts after the timeout either way.
function wireClearConfirm(button, onConfirm) {
    if (!button) return;
    const originalLabel = button.innerText;
    let confirming = false;
    let revertTimer = null;

    button.addEventListener('click', () => {
        if (!confirming) {
            confirming = true;
            button.innerText = 'Confirm?';
            button.classList.add('confirm-pending');
            revertTimer = setTimeout(() => {
                confirming = false;
                button.innerText = originalLabel;
                button.classList.remove('confirm-pending');
            }, 3000);
        } else {
            clearTimeout(revertTimer);
            confirming = false;
            button.innerText = originalLabel;
            button.classList.remove('confirm-pending');
            onConfirm();
        }
    });
}

// Session history strip: a running log of actions taken during this
// Structure-mode session (Push 4 → Pop 4 → ...). Purely in-memory, reset
// every time a new workspace loads — spec leaves persistence undecided,
// and there's no backend to persist to anyway.
let sessionHistory = [];

function renderSessionHistory() {
    const strip = document.getElementById('session-history');
    if (!strip) return;

    if (sessionHistory.length === 0) {
        strip.innerHTML = '';
        strip.classList.add('hidden');
        return;
    }

    strip.classList.remove('hidden');
    strip.innerHTML = sessionHistory
        .map((action, i) => {
            const isLatest = i === sessionHistory.length - 1;
            return `<span class="session-chip${isLatest ? ' session-chip-latest' : ''}">${action}</span>`;
        })
        .join('<span class="session-arrow">\u2192</span>');

    strip.scrollLeft = strip.scrollWidth; // keep the newest entry in view
}

function logSessionAction(text) {
    sessionHistory.push(text);
    if (sessionHistory.length > 12) sessionHistory.shift(); // cap so the strip doesn't grow unbounded
    renderSessionHistory();
}

function resetSessionHistory() {
    sessionHistory = [];
    renderSessionHistory();
}

// --- 4. EVENT LISTENERS (ON LOAD) ---
document.addEventListener('DOMContentLoaded', () => {

    // Complexity tag tooltip: Escape dismisses it (spec §5.2). Hover/mouseleave
    // and blur are already handled by CSS :hover/:focus, this covers the one
    // case CSS can't: an explicit Escape keypress while a tag is focused.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.activeElement && document.activeElement.classList.contains('complexity-tag')) {
            document.activeElement.blur();
        }
    });

    // Interim Theory Drawer toggle (index.html has the "why interim" note;
    // full slide-in treatment + mobile full-screen sheet lands in Phase 7).
    const theoryToggleBtn = document.getElementById('theory-toggle-btn');
    const theoryDrawer = document.getElementById('theory-drawer');
    const theoryScrim = document.getElementById('theory-scrim');
    const theoryCloseBtn = document.getElementById('theory-close-btn');

    function openTheoryDrawer() {
        if (!theoryDrawer || !theoryScrim || !theoryToggleBtn) return;
        theoryDrawer.classList.remove('hidden');
        theoryScrim.classList.remove('hidden');
        theoryDrawer.setAttribute('aria-hidden', 'false');
        theoryToggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeTheoryDrawer() {
        if (!theoryDrawer || !theoryScrim || !theoryToggleBtn) return;
        theoryDrawer.classList.add('hidden');
        theoryScrim.classList.add('hidden');
        theoryDrawer.setAttribute('aria-hidden', 'true');
        theoryToggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (theoryToggleBtn) {
        theoryToggleBtn.addEventListener('click', () => {
            const isOpen = theoryDrawer && !theoryDrawer.classList.contains('hidden');
            if (isOpen) closeTheoryDrawer(); else openTheoryDrawer();
        });
    }
    if (theoryCloseBtn) theoryCloseBtn.addEventListener('click', closeTheoryDrawer);
    if (theoryScrim) theoryScrim.addEventListener('click', closeTheoryDrawer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && theoryDrawer && !theoryDrawer.classList.contains('hidden')) {
            closeTheoryDrawer();
        }
    });
    
    // Welcome Screen -> Dashboard
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            showScreen('dashboard-screen');
            buildDashboard('array'); // Automatically load the first category
        });
    }

    // Hero quick-jump badges -> Dashboard, pre-filtered to that category
    document.querySelectorAll('.quick-jump-badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
            const categoryId = e.currentTarget.getAttribute('data-target');
            if (!categoryId) return;
            showScreen('dashboard-screen');
            buildDashboard(categoryId);
            // Keep the sidebar's active state consistent with where we just landed
            document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
            const matchingSidebarItem = document.querySelector(`.sidebar-nav li[data-target="${categoryId}"]`);
            if (matchingSidebarItem) matchingSidebarItem.classList.add('active');
        });
    });

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

            // Code-line sync covers JS, Python, and C++ — re-check and either
            // show or clear the highlight for the newly active tab.
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