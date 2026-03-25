// ==========================================
// 1. SPA ROUTER & NAVIGATION (CLEAN SLATE)
// ==========================================
const welcomeScreen = document.getElementById('welcome-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const workspaceScreen = document.getElementById('workspace-screen');

const getStartedBtn = document.getElementById('get-started-btn');

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

// ONLY the "Get Started" button works now.
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => navigateTo(dashboardScreen));
}

// ==========================================
// 2. THE UI BUILDER (Dynamic Workspace)
// ==========================================
const backBtn = document.getElementById('back-to-dashboard-btn');
const algoCards = document.querySelectorAll('.algo-card');

// Hook up the Back Button
if (backBtn) {
    backBtn.addEventListener('click', () => navigateTo(dashboardScreen));
}

// Add click listeners to EVERY card on the dashboard
algoCards.forEach(card => {
    card.addEventListener('click', () => {
        const targetAlgo = card.getAttribute('data-target'); // e.g., "linear-search"
        
        // 1. Check if the algorithm exists in our Vault (data.js)
        if (algoData[targetAlgo]) {
            buildWorkspace(targetAlgo);
            navigateTo(workspaceScreen);
        } else {
            console.log("Data for " + targetAlgo + " not found in the vault yet!");
            alert("Coming soon!");
        }
    });
});

/**
 * Grabs data from the Vault and injects it into the HTML Template
 */
function buildWorkspace(algoId) {
    const data = algoData[algoId]; // Fetch from Vault

    // 1. Update Titles & Text
    document.getElementById('workspace-title').innerText = data.title;
    document.getElementById('algo-description').innerText = data.description;
    document.getElementById('time-worst').innerText = data.complexities.worst;
    document.getElementById('space-complexity').innerText = data.complexities.space;

    // 2. Inject default code (JavaScript)
    document.getElementById('code-snippet').innerText = data.code.javascript;

    // 3. Build the Controls (Inputs vs Sliders)
    const controlsZone = document.getElementById('dynamic-controls');
    controlsZone.innerHTML = ''; // Clear old controls

    if (data.type === "search") {
        controlsZone.innerHTML = `
            <input type="text" id="array-input" placeholder="e.g. 3, 1, 4, 1, 5" style="padding: 8px; border-radius: 4px; border: none; margin-right: 10px;">
            <input type="number" id="target-input" placeholder="Target e.g. 4" style="padding: 8px; border-radius: 4px; border: none; margin-right: 10px;">
            <button id="action-btn" class="primary-btn" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Search</button>
        `;
        // Connect the specific button we just created!
        document.getElementById('action-btn').addEventListener('click', () => {
            const arrayInput = document.getElementById('array-input').value;
            
            // Convert string "3, 1, 4" into an actual array of numbers [3, 1, 4]
            const arr = arrayInput.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
            
            if (arr.length === 0) {
                alert("Please enter some numbers separated by commas.");
                return;
            }

            // Draw the blocks!
            drawArray(arr);
            
            // TODO: We will trigger the actual algorithms.js logic here next!
        });
    } else if (data.type === "sort") {
        controlsZone.innerHTML = `
            <label style="color: white; margin-right: 10px;">Size: <input type="range" id="size-slider" min="5" max="50"></label>
            <button id="action-btn" class="primary-btn" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Sort</button>
        `;
    }
}