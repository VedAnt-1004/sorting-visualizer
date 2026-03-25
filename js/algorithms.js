// ==========================================
// THE ALGORITHMS (The Brain)
// ==========================================

/**
 * Linear Search Algorithm
 * Visually checks each block one by one until it finds the target.
 */
async function linearSearchEngine(arr, target) {
    // Disable the search button so the user can't spam it while it's running
    const searchBtn = document.getElementById('action-btn');
    if (searchBtn) searchBtn.disabled = true;

    let found = false;

    // Loop through every single block
    for (let i = 0; i < arr.length; i++) {
        // 1. Find the specific HTML block we want to look at
        const currentBlock = document.getElementById(`block-${i}`);
        
        // 2. Turn it Orange (Checking state)
        currentBlock.classList.add('current');
        
        // 3. Wait for 500 milliseconds so the user can actually see it checking
        await sleep(500); 

        // 4. Did we find the target?
        if (arr[i] === target) {
            // Turn it Green (Found state)
            currentBlock.classList.remove('current');
            currentBlock.classList.add('found');
            found = true;
            break; // Stop the loop! We found it.
        } else {
            // Not a match. Remove the Orange color and move to the next one
            currentBlock.classList.remove('current');
        }
    }

    if (!found) {
        alert("Target not found in the array.");
    }

    // Re-enable the search button
    if (searchBtn) searchBtn.disabled = false;
}