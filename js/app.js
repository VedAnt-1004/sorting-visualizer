// ==========================================
// 1. SPA ROUTER & NAVIGATION
// ==========================================
const welcomeScreen = document.getElementById('welcome-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const workspaceScreen = document.getElementById('workspace-screen');

const getStartedBtn = document.getElementById('get-started-btn');
const backBtn = document.getElementById('back-to-dashboard-btn');
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

// Hook up the Welcome and Back Buttons
if (getStartedBtn) getStartedBtn.addEventListener('click', () => navigateTo(dashboardScreen));
if (backBtn) backBtn.addEventListener('click', () => navigateTo(dashboardScreen));


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

    // 1. Update Titles & Text in the Textbook area
    document.getElementById('workspace-title').innerText = data.title;
    document.getElementById('algo-description').innerText = data.description;
    document.getElementById('time-worst').innerText = data.complexities.worst;
    document.getElementById('space-complexity').innerText = data.complexities.space;
    document.getElementById('code-snippet').innerText = data.code.javascript;

    // 2. Build the Controls (Inputs vs Sliders)
    const controlsZone = document.getElementById('dynamic-controls');
    controlsZone.innerHTML = ''; // Clear old controls

    // 3. NEW: Hide the status bar when a new workspace loads!
    const statusBar = document.getElementById('status-bar');
    if (statusBar) statusBar.className = 'status-message hidden';

    // If it's a Search algorithm, build Text Inputs
    if (data.type === "search") {
        controlsZone.innerHTML = `
            <input type="text" id="array-input" placeholder="e.g. 3, 1, 4, 1, 5" style="padding: 8px; border-radius: 4px; border: none; margin-right: 10px; width: 200px;">
            <input type="number" id="target-input" placeholder="Target e.g. 4" style="padding: 8px; border-radius: 4px; border: none; margin-right: 10px; width: 120px;">
            <button id="action-btn" class="primary-btn" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Search</button>
        `;

        // Tell the new Search button what to do when clicked!
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

            // 1. Draw the blocks on the screen (from visualizer.js)
            if (typeof drawArray === 'function') {
                drawArray(arr);
            }
            
            // 2. Fire the Algorithm Engine! (from algorithms.js)
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