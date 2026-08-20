
// ==========================================
// UNIVERSAL ANIMATION ENGINE (The Artist)
// ==========================================
const visualizerContainer = document.getElementById('visualizer-container');

// --- SHARED SPEED CONTROL ---
// Every algorithm engine (search, sorting, future ones) reads its delay
// from here, so one slider in the UI controls all of them consistently.
let animationSpeed = 500; // milliseconds

function setSpeed(ms) {
    animationSpeed = ms;
}

function getSpeed() {
    return animationSpeed;
}

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

// ==========================================
// STEP RENDERING (used by every generator-based engine)
// ==========================================
/**
 * Renders a single "step" snapshot: the array values plus which indices
 * are in which visual state. Every algorithm generator yields objects in
 * this shape, so this is the ONLY place that touches block DOM/classes.
 *
 * step.highlights supports: comparing[], current[], sorted[], dimmed[], found (single index)
 */
function renderStep(step) {
    if (!step) return;
    const { array, highlights = {}, message = '', statusClass = 'searching' } = step;

    let blocks = document.querySelectorAll('.array-block');

    // Redraw from scratch if the array length changed (first render, or reset)
    if (blocks.length !== array.length) {
        drawArray(array);
        blocks = document.querySelectorAll('.array-block');
    } else {
        array.forEach((value, i) => {
            if (blocks[i].innerText != value) blocks[i].innerText = value;
        });
    }

    // Clear all transient states before applying this step's highlights
    blocks.forEach(b => {
        b.classList.remove('comparing', 'current', 'sorted', 'found');
        b.style.opacity = '1';
        b.style.transform = '';
    });

    (highlights.sorted || []).forEach(i => blocks[i] && blocks[i].classList.add('sorted'));
    (highlights.comparing || []).forEach(i => blocks[i] && blocks[i].classList.add('comparing'));
    (highlights.current || []).forEach(i => blocks[i] && blocks[i].classList.add('current'));
    (highlights.dimmed || []).forEach(i => {
        if (blocks[i]) blocks[i].style.opacity = '0.25';
    });
    if (highlights.found !== undefined && highlights.found !== null) {
        blocks[highlights.found] && blocks[highlights.found].classList.add('found');
    }

    const statusBar = document.getElementById('status-bar');
    if (statusBar) {
        statusBar.className = `status-message ${statusClass}`;
        statusBar.innerText = message;
    }
}

// ==========================================
// STEP PLAYER (drives any generator-based algorithm engine)
// ==========================================
class StepPlayer {
    /**
     * @param {GeneratorFunction} generatorFn - a function* that yields step objects
     * @param {...any} args - arguments passed to generatorFn (e.g. array, target)
     */
    constructor(generatorFn, ...args) {
        this.generator = generatorFn(...args);
        this.cache = [];     // every step pulled so far, so Prev never re-runs logic
        this.pointer = -1;   // index into cache currently on screen
        this.done = false;
        this.playing = false;
        this._timer = null;
        this.onStep = null; // optional callback(step) fired whenever a step is rendered
    }

    _pullNext() {
        if (this.pointer < this.cache.length - 1) {
            this.pointer++;
            return this.cache[this.pointer];
        }
        if (this.done) return null;
        const result = this.generator.next();
        if (result.done) {
            this.done = true;
            return null;
        }
        this.cache.push(result.value);
        this.pointer++;
        return result.value;
    }

    next() {
        const step = this._pullNext();
        if (step) {
            renderStep(step);
            if (this.onStep) this.onStep(step);
        }
        return step;
    }

    prev() {
        if (this.pointer <= 0) return null;
        this.pointer--;
        const step = this.cache[this.pointer];
        renderStep(step);
        if (this.onStep) this.onStep(step);
        return step;
    }

    play(onFinish) {
        this.playing = true;
        const tick = () => {
            if (!this.playing) return;
            const step = this.next();
            if (!step) {
                this.playing = false;
                if (onFinish) onFinish();
                return;
            }
            this._timer = setTimeout(tick, getSpeed());
        };
        tick();
    }

    pause() {
        this.playing = false;
        clearTimeout(this._timer);
    }

    isAtStart() {
        return this.pointer <= 0;
    }

    isAtEnd() {
        return this.done && this.pointer >= this.cache.length - 1;
    }
}
