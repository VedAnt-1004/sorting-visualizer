
// ==========================================
// STACK ENGINE (js/structures/stack.js)
// ==========================================
// Unlike search/sorting, this is a LIVE, persistent structure — operations
// happen one at a time over an open-ended session, not as a single
// step-through run. So there's no generator/StepPlayer here; each function
// mutates stackState directly and re-renders immediately.

let stackState = [];

function renderStack() {
    const container = document.getElementById('visualizer-container');
    if (!container) return;

    container.classList.remove('queue-mode');
    container.classList.add('stack-mode');
    container.innerHTML = '';

    if (stackState.length === 0) {
        const empty = document.createElement('div');
        empty.classList.add('empty-structure-msg');
        empty.innerText = 'Stack is empty — push a value to begin';
        container.appendChild(empty);
        return;
    }

    stackState.forEach((value, idx) => {
        const isTop = idx === stackState.length - 1;

        const wrapper = document.createElement('div');
        wrapper.classList.add('stack-block-wrapper');

        const block = document.createElement('div');
        block.classList.add('array-block');
        block.innerText = value;
        if (isTop) block.classList.add('current');
        wrapper.appendChild(block);

        if (isTop) {
            const label = document.createElement('span');
            label.classList.add('stack-side-label');
            label.innerText = '← TOP';
            wrapper.appendChild(label);
        }

        container.appendChild(wrapper);
    });
}

async function pushToStack(value) {
    stackState.push(value);
    renderStack();

    const statusBar = document.getElementById('status-bar');
    statusBar.className = 'status-message success';
    statusBar.innerText = `Pushed ${value} onto the stack`;
}

async function popFromStack() {
    const statusBar = document.getElementById('status-bar');

    if (stackState.length === 0) {
        statusBar.className = 'status-message error';
        statusBar.innerText = 'Stack is empty — nothing to pop';
        return null;
    }

    const container = document.getElementById('visualizer-container');
    const topWrapper = container.lastElementChild;
    const topBlock = topWrapper ? topWrapper.querySelector('.array-block') : null;
    if (topBlock) topBlock.classList.add('popping');

    await sleep(300); // matches the .array-block CSS transition duration

    const popped = stackState.pop();
    renderStack();

    statusBar.className = 'status-message success';
    statusBar.innerText = `Popped ${popped} from the stack`;
    return popped;
}

function peekStack() {
    const statusBar = document.getElementById('status-bar');

    if (stackState.length === 0) {
        statusBar.className = 'status-message error';
        statusBar.innerText = 'Stack is empty — nothing to peek';
        return null;
    }

    renderStack();
    statusBar.className = 'status-message searching';
    statusBar.innerText = `Top of stack: ${stackState[stackState.length - 1]}`;
    return stackState[stackState.length - 1];
}

function clearStack() {
    stackState = [];
    renderStack();
    const statusBar = document.getElementById('status-bar');
    if (statusBar) statusBar.className = 'status-message hidden';
}
