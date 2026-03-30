// ==========================================
// MAIN UI MANAGER (js/app.js)
// ==========================================

let currentActiveCodes = {}; // Stores code for the currently selected algorithm

function buildWorkspace(algoId) {
    // 1. Pull data from the new encyclopedia
    const data = algorithmDatabase[algoId];
    
    if (!data) {
        console.error("Algorithm not found in database:", algoId);
        return;
    }

    // 2. Update Navbar
    const navTitle = document.getElementById('nav-title');
    if (navTitle) navTitle.innerText = data.title;

    // 3. Update Theory & Code Panels
    const desc = document.getElementById('algo-description');
    const timeW = document.getElementById('time-worst');
    const spaceC = document.getElementById('space-complexity');
    const codeS = document.getElementById('code-snippet');
    
    if (desc) desc.innerText = data.description;
    if (timeW) timeW.innerText = data.complexities.worst;
    if (spaceC) spaceC.innerText = data.complexities.space;
    
    if (data.code) {
        currentActiveCodes = data.code; 
        if (codeS) codeS.innerText = currentActiveCodes.javascript; // Default to JS
        
        // Reset the tabs
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        if(tabs.length > 0) tabs[0].classList.add('active'); 
    }

    // 4. Build the Control Panel
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
                const originalStr = arr.join(',');
                arr.sort((a, b) => a - b);
                if (originalStr !== arr.join(',')) {
                    document.getElementById('array-input').value = arr.join(', '); 
                }
            }

            if (typeof drawArray === 'function') drawArray(arr);
            
            if (algoId === 'linear-search') linearSearchEngine(arr, target);
            else if (algoId === 'binary-search') binarySearchEngine(arr, target);
        });
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Sidebar Click Routing
document.querySelectorAll('.sidebar-nav li').forEach(item => {
    item.addEventListener('click', (e) => {
        // Remove active class from all, add to clicked
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const algoId = e.currentTarget.getAttribute('data-algo');
        if (algoId) {
            buildWorkspace(algoId);
        }
    });
});

// Code Panel Tabs Logic
const codeTabs = document.querySelectorAll('.tab-btn');
const codeSnippet = document.getElementById('code-snippet');
const copyBtn = document.getElementById('copy-btn');

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
        } else {
            codeSnippet.innerText = "// Code snippet not available yet.";
        }
    });
});

// Copy Button Logic
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const textToCopy = codeSnippet.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.innerHTML = "✅ Copied!";
            copyBtn.classList.add('copied'); 
            setTimeout(() => {
                copyBtn.innerHTML = "📋 Copy Code";
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
}