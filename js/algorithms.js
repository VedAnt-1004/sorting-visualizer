// ==========================================
// THE ALGORITHMS (The Brain)
// ==========================================

/**
 * Linear Search Algorithm
 * Visually checks each block and updates the status bar.
 */
async function linearSearchEngine(arr, target) {
    const searchBtn = document.getElementById('action-btn');
    const statusBar = document.getElementById('status-bar');

    if (searchBtn) searchBtn.disabled = true;

    // 1. Set Status Bar to "Searching" state
    if (statusBar) {
        statusBar.className = 'status-message searching';
        statusBar.innerText = `Searching for ${target}...`;
    }

    let found = false;

    // Loop through every single block
    for (let i = 0; i < arr.length; i++) {
        const currentBlock = document.getElementById(`block-${i}`);
        
        // Update Status Bar text
        if (statusBar) statusBar.innerText = `Checking index [${i}]...`;
        
        currentBlock.classList.add('current');
        await sleep(500); 

        // Did we find it?
        if (arr[i] === target) {
            currentBlock.classList.remove('current');
            currentBlock.classList.add('found');
            found = true;
            
            // 2. Set Status Bar to "Success" state
            if (statusBar) {
                statusBar.className = 'status-message success';
                statusBar.innerText = `Element ${target} found at index [${i}]!`;
            }
            break; 
        } else {
            currentBlock.classList.remove('current');
        }
    }

    // 3. Set Status Bar to "Error" state if not found
    if (!found) {
        if (statusBar) {
            statusBar.className = 'status-message error';
            statusBar.innerText = `Element ${target} not found in the array.`;
        }
    }

    if (searchBtn) searchBtn.disabled = false;
}