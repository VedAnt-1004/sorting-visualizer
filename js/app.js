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

    // 1. Update Breadcrumb
    const bcCategory = document.getElementById('bc-category');
    const bcTitle = document.getElementById('bc-title');
    if (bcCategory) bcCategory.innerText = data.category;
    if (bcTitle) bcTitle.innerText = data.title;

    // 2. Update Textbook Text
    const desc = document.getElementById('algo-description');
    const timeW = document.getElementById('time-worst');
    const spaceC = document.getElementById('space-complexity');
    const codeS = document.getElementById('code-snippet');
    
    if (desc) desc.innerText = data.description;
    if (timeW) timeW.innerText = data.complexities.worst;
    if (spaceC) spaceC.innerText = data.complexities.space;
    if (codeS) codeS.innerText = data.code.javascript;

    // 3. Hide status bar
    const statusBar = document.getElementById('status-bar');
    if (statusBar) statusBar.className = 'status-message hidden';

    // 4. Build Controls (100% Clean HTML)
    const controlsZone = document.getElementById('dynamic-controls');
    if (!controlsZone) return; 
    controlsZone.innerHTML = ''; 

    // SEARCH ALGORITHMS
    if (data.type === "search") {
        controlsZone.innerHTML = `
            <input type="text" id="array-input" class="workspace-input array-input" placeholder="e.g. 3, 1, 4, 1, 5">
            <input type="number" id="target-input" class="workspace-input target-input" placeholder="Target e.g. 4">
            <button id="action-btn" class="action-btn btn-search">Search</button>
        `;

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