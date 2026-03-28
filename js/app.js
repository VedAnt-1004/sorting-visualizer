// ==========================================
// 1. SPA ROUTER & NAVIGATION
// ==========================================
const welcomeScreen = document.getElementById('welcome-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const workspaceScreen = document.getElementById('workspace-screen');

const getStartedBtn = document.getElementById('get-started-btn');
const homeLink = document.getElementById('home-link'); // The new Glassmorphism Logo Button
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

// Hook up the Welcome and new Home Logo Buttons
if (getStartedBtn) getStartedBtn.addEventListener('click', () => navigateTo(dashboardScreen));
if (homeLink) homeLink.addEventListener('click', () => navigateTo(dashboardScreen));


// ==========================================
// 2. THE UI BUILDER (Dynamic Workspace)
// ==========================================

// Add click listeners to EVERY card on the dashboard
algoCards.forEach(card => {
    card.addEventListener('click', () => {
        const targetAlgo = card.getAttribute('data-target'); // e.g., "linear-search"
        
        // Check if the algorithm exists in our Vault (data.js)
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
    const data = algoData[algoId]; // Fetch from Vault

    // 1. Update the new Breadcrumb
    const bcCategory = document.getElementById('bc-category');
    const bcTitle = document.getElementById('bc-title');
    if (bcCategory) bcCategory.innerText = data.category;
    if (bcTitle) bcTitle.innerText = data.title;

    // 2. Update Text in the Textbook area
    const desc = document.getElementById('algo-description');
    const timeW = document.getElementById('time-worst');
    const spaceC = document.getElementById('space-complexity');
    const codeS = document.getElementById('code-snippet');
    
    if (desc) desc.innerText = data.description;
    if (timeW) timeW.innerText = data.complexities.worst;
    if (spaceC) spaceC.innerText = data.complexities.space;
    if (codeS) codeS.innerText = data.code.javascript;

    // 3. Hide the status bar when a new workspace loads
    const statusBar = document.getElementById('status-bar');
    if (statusBar) statusBar.className = 'status-message hidden';

    // 4. Build the Controls (Inputs vs Sliders)
    const controlsZone = document.getElementById('dynamic-controls');
    if (!controlsZone) return; // Safety check
    controlsZone.innerHTML = ''; // Clear old controls

    // If it's a Search algorithm, build Text Inputs
    if (data.type === "search") {
        controlsZone.innerHTML = `
            <input type="text" id="array-input" placeholder="e.g. 3, 1, 4, 1, 5" style="padding: 8px; border-radius: 4px; border: none; margin-right: 10px; width: 200px;">
            <input type="number" id="target-input" placeholder="Target e.g. 4" style="padding: 8px; border-radius: 4px; border: none; margin-right: 10px; width: 120px;">
            <button id="action-btn" class="primary-btn" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Search</button>
        `;

        // Tell the new Search button what to do when clicked
        document.getElementById('action-btn').addEventListener('click', () => {
            const arrayInput = document.getElementById('array-input').value;
            const targetInput = document.getElementById('target-input').value;
            
            // Convert string "3, 1, 4" into an actual array of numbers
            const arr = arrayInput.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
            const target = parseInt(targetInput);
            
            if (arr.length === 0 || isNaN(target)) {
                alert("Please enter valid numbers for both the array and the target.");
                return;
            }

            // Draw the blocks on the screen
            if (typeof drawArray === 'function') {
                drawArray(arr);
            }
            
            // Fire the Algorithm Engine!
            if (typeof linearSearchEngine === 'function') {
                linearSearchEngine(arr, target);
            }
        });
    } 
    // If it's a Sort algorithm, build Sliders (We will use this later!)
    else if (data.type === "sort") {
        controlsZone.innerHTML = `
            <label style="color: white; margin-right: 10px;">Size: <input type="range" id="size-slider" min="5" max="50"></label>
            <button id="action-btn" class="primary-btn" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Sort</button>
        `;
    }
}