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

// All old algorithms, array generators, and workspace buttons have been officially purged!