
// ==========================================
// UNIVERSAL ANIMATION ENGINE (The Artist)
// ==========================================
const visualizerContainer = document.getElementById('visualizer-container');

/**
 * Takes an array of numbers and draws them as blocks on the screen
 */
function drawArray(arr) {
    visualizerContainer.innerHTML = ''; // Clear the board

    arr.forEach((value, index) => {
        // 1. Create the outer wrapper
        const wrapper = document.createElement('div');
        wrapper.classList.add('block-wrapper');

        // 2. Create the main square block
        const block = document.createElement('div');
        block.classList.add('array-block');
        block.id = `block-${index}`; // Give it an ID so we can color it later
        block.innerText = value;

        // 3. Create the little index label underneath [0], [1], etc.
        const indexLabel = document.createElement('span');
        indexLabel.classList.add('block-index');
        indexLabel.innerText = `[${index}]`;

        // 4. Put them together and add to the screen
        wrapper.appendChild(block);
        wrapper.appendChild(indexLabel);
        visualizerContainer.appendChild(wrapper);
    });
}

/**
 * Simple helper to pause code execution (used for animations)
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}