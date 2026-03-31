// ==========================================
// MAIN UI MANAGER (js/app.js)
// ==========================================

let currentActiveCodes = {}; // Stores code for the currently selected algorithm

// --- 1. SCREEN NAVIGATION ENGINE ---
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    // Show the target screen
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

// --- 2. WORKSPACE BUILDER ---
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

    // Build the Control Panel
    const controlsZone = document.getElementById('dynamic-controls');
    
    if (data.type === "search") {
        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="text" id="array-input" class="dashboard-input wireframe-array-input" placeholder="e.g. 3, 1, 4, 1, 5">
                <input type="number" id="target-input" class="dashboard-input wireframe-target-input" placeholder="Target">
            </div>
            
            <div class="control-row center-content">
                <button id="random-btn" class="dashboard-btn btn-secondary">Random</button>
                <button id="action-btn" class="dashboard-btn btn-blue wireframe-search-btn">Search</button>
                <button id="reset-btn" class="dashboard-btn btn-red">Reset</button>
            </div>
        `;

        // Inner Listeners for Search Controls
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

            if (typeof drawArray === 'function') drawArray(arr);
            
            if (algoId === 'linear-search') linearSearchEngine(arr, target);
            else if (algoId === 'binary-search') binarySearchEngine(arr, target);
        });
    }
}

// --- 3. EVENT LISTENERS (ON LOAD) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Welcome Screen -> Dashboard
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            showScreen('dashboard-screen');
        });
    }

    // Dashboard Cards -> Workspace
    document.querySelectorAll('.algo-card').forEach(card => {
        card.addEventListener('click', () => {
            const algoId = card.getAttribute('data-target');
            if (algoId && algorithmDatabase[algoId]) {
                buildWorkspace(algoId);
                showScreen('workspace-screen');
                window.scrollTo(0, 0);
            } else {
                alert("This algorithm is currently under development!");
            }
        });
    });

    // Home Logo -> Back to Dashboard
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            showScreen('dashboard-screen');
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