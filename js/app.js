// ==========================================
// 1. SPA ROUTER & NAVIGATION
// ==========================================
const welcomeScreen = document.getElementById('welcome-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const workspaceScreen = document.getElementById('workspace-screen');

const getStartedBtn = document.getElementById('get-started-btn');
const homeLink = document.getElementById('home-link');
const algoCards = document.querySelectorAll('.algo-card');

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
    }
}

// Hook up the Welcome and Home Logo Buttons
if (getStartedBtn) getStartedBtn.addEventListener('click', () => navigateTo(dashboardScreen));
if (homeLink) homeLink.addEventListener('click', () => navigateTo(dashboardScreen));


// ==========================================
// 2. THE UI BUILDER (Dynamic Workspace)
// ==========================================

// Add click listeners to EVERY card on the dashboard
algoCards.forEach(card => {
    card.addEventListener('click', () => {
        const targetAlgo = card.getAttribute('data-target');
        
        if (algoData && algoData[targetAlgo]) {
            buildWorkspace(targetAlgo);
            navigateTo(workspaceScreen);
        } else {
            alert("Coming soon! We haven't added this to the Vault yet.");
        }
    });
});

/**
 * Grabs data from the Vault and injects it into the HTML Template
 */
function buildWorkspace(algoId) {
    const data = algoData[algoId]; 

    // 1. Update Navbar Title
    const navTitle = document.getElementById('nav-title');
    if (navTitle) navTitle.innerText = data.title;

    // 2. Update Textbook Text & Code Panel
    const desc = document.getElementById('algo-description');
    const timeW = document.getElementById('time-worst');
    const spaceC = document.getElementById('space-complexity');
    const codeS = document.getElementById('code-snippet');
    
    if (desc) desc.innerText = data.description;
    if (timeW) timeW.innerText = data.complexities.worst;
    if (spaceC) spaceC.innerText = data.complexities.space;
    
    // Feed the global variable for the tabs!
    if (data.code) {
        currentActiveCodes = data.code; 
        if (codeS) codeS.innerText = currentActiveCodes.javascript; // Default to JS
        
        // Reset the tabs so JS is highlighted when opening a new algo
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        if(tabs.length > 0) tabs[0].classList.add('active'); 
    }

    // 3. Hide status bar
    const statusBar = document.getElementById('status-bar');
    if (statusBar) statusBar.className = 'status-message hidden';

    // 4. Build Controls (100% Clean HTML)
    const controlsZone = document.getElementById('dynamic-controls');
    if (!controlsZone) return; 
    controlsZone.innerHTML = ''; 

    // SEARCH ALGORITHMS (Wireframe + Pro Buttons)
    if (data.type === "search") {
        controlsZone.innerHTML = `
            <div class="control-row controls-top-row">
                <input type="text" id="array-input" class="dashboard-input wireframe-array-input" placeholder="e.g. 3, 1, 4, 1, 5">
                <input type="number" id="target-input" class="dashboard-input wireframe-target-input" placeholder="Target e.g. 4">
            </div>
            
            <div class="control-row center-content">
                <button id="random-btn" class="dashboard-btn btn-secondary">Random</button>
                <button id="action-btn" class="dashboard-btn btn-blue wireframe-search-btn">Search</button>
                <button id="reset-btn" class="dashboard-btn btn-red">Reset</button>
            </div>
        `;

        // 1. Random Array Generator Logic
        document.getElementById('random-btn').addEventListener('click', () => {
            const randomArr = Array.from({length: 7}, () => Math.floor(Math.random() * 99) + 1);
            document.getElementById('array-input').value = randomArr.join(', ');
            const randomTarget = randomArr[Math.floor(Math.random() * randomArr.length)];
            document.getElementById('target-input').value = randomTarget;
        });

        // 2. Reset Button Logic
        document.getElementById('reset-btn').addEventListener('click', () => {
            document.getElementById('array-input').value = '';
            document.getElementById('target-input').value = '';
            const visualizerContainer = document.getElementById('visualizer-container');
            if (visualizerContainer) visualizerContainer.innerHTML = '';
            const statusBar = document.getElementById('status-bar');
            if (statusBar) statusBar.className = 'status-message hidden';
        });

        // 3. Go (Search) Button Logic
        document.getElementById('action-btn').addEventListener('click', () => {
            const arrayInput = document.getElementById('array-input').value;
            const targetInput = document.getElementById('target-input').value;
            
            const arr = arrayInput.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
            const target = parseInt(targetInput);
            
            if (arr.length === 0 || isNaN(target)) {
                alert("Please enter valid numbers for both the array and the target.");
                return;
            }

            if (typeof drawArray === 'function') drawArray(arr);
            if (typeof linearSearchEngine === 'function') linearSearchEngine(arr, target);
        });
    }
    // SORTING ALGORITHMS
    else if (data.type === "sort") {
        controlsZone.innerHTML = `
            <label class="slider-label">Size: <input type="range" id="size-slider" min="5" max="50"></label>
            <button id="action-btn" class="action-btn btn-sort">Sort</button>
        `;
    }
}

// ==========================================
// 3. CODE PANEL LOGIC (Tabs & Copy Button)
// ==========================================
let currentActiveCodes = {}; // Stores the code for the currently selected algorithm

const codeTabs = document.querySelectorAll('.tab-btn');
const codeSnippet = document.getElementById('code-snippet');
const copyBtn = document.getElementById('copy-btn');

// 1. Tab Switching Logic
codeTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Remove active class from all tabs
        codeTabs.forEach(t => t.classList.remove('active'));
        // Add active class to the clicked tab
        e.target.classList.add('active');

        // Figure out which language was clicked
        const selectedLang = e.target.innerText;
        let dataKey = 'javascript'; // Default
        
        if (selectedLang === 'Python') dataKey = 'python';
        if (selectedLang === 'C++') dataKey = 'cpp'; // Or 'c++' depending on your data.js format

        // Inject the code into the `<pre><code>` block
        if (currentActiveCodes && currentActiveCodes[dataKey]) {
            codeSnippet.innerText = currentActiveCodes[dataKey];
        } else {
            codeSnippet.innerText = "// Code snippet not available for this language yet.";
        }
    });
});

// 2. Copy Button Logic (Uses modern Clipboard API)
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const textToCopy = codeSnippet.innerText;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Success visual feedback
            copyBtn.innerHTML = "✅ Copied!";
            copyBtn.classList.add('copied'); // Triggers the green CSS style
            
            // Reset back to normal after 2 seconds
            setTimeout(() => {
                copyBtn.innerHTML = "📋 Copy Code";
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert("Oops! Your browser blocked the copy action.");
        });
    });
}