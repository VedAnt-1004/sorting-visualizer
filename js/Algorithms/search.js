// ==========================================
// SEARCH ALGORITHMS ENGINE (js/algorithms/search.js)
// ==========================================
// Note: The 'sleep' function is now globally handled by visualizer.js!

async function linearSearchEngine(arr, target) {
    const blocks = document.querySelectorAll('.array-block');
    const statusBar = document.getElementById('status-bar');

    statusBar.className = 'status-message searching';
    statusBar.innerText = `Searching for ${target}...`;

    for (let i = 0; i < arr.length; i++) {
        blocks[i].classList.add('current'); 
        await sleep(500); 

        if (arr[i] === target) {
            blocks[i].classList.remove('current');
            blocks[i].classList.add('found'); 
            statusBar.className = 'status-message success';
            statusBar.innerText = `Element ${target} found at index [${i}]!`;
            return;
        }
        blocks[i].classList.remove('current'); 
    }

    statusBar.className = 'status-message error';
    statusBar.innerText = `Element ${target} not found in the array.`;
}

async function binarySearchEngine(arr, target) {
    const blocks = document.querySelectorAll('.array-block');
    const statusBar = document.getElementById('status-bar');

    statusBar.className = 'status-message searching';
    statusBar.innerText = `Starting Binary Search for ${target}...`;

    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        // Visual Magic: Dim the blocks outside our search window
        for (let i = 0; i < blocks.length; i++) {
            if (i < left || i > right) {
                blocks[i].style.opacity = '0.2'; 
                blocks[i].style.transform = 'scale(0.95)'; 
            } else {
                blocks[i].style.opacity = '1';
            }
        }

        statusBar.innerText = `Checking middle element at index [${mid}]...`;
        blocks[mid].classList.add('current');
        await sleep(800);

        if (arr[mid] === target) {
            blocks[mid].classList.remove('current');
            blocks[mid].classList.add('found');
            statusBar.className = 'status-message success';
            statusBar.innerText = `Element ${target} found at index [${mid}]!`;
            return; 
        }

        if (arr[mid] < target) {
            statusBar.innerText = `${arr[mid]} is too small. Discarding left half.`;
            left = mid + 1;
        } else {
            statusBar.innerText = `${arr[mid]} is too big. Discarding right half.`;
            right = mid - 1;
        }

        blocks[mid].classList.remove('current');
        await sleep(600);
    }

    statusBar.className = 'status-message error';
    statusBar.innerText = `Element ${target} not found.`;
    
    // Reset opacities just in case
    blocks.forEach(b => {
        b.style.opacity = '1';
        b.style.transform = 'scale(1)';
    });
}