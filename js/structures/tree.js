
// ==========================================
// BINARY SEARCH TREE ENGINE (js/structures/tree.js)
// ==========================================
// Same "live/persistent structure" pattern as stack.js and queue.js — no
// generator/StepPlayer. Unlike arrays, a tree can't be laid out with fixed
// CSS blocks, so this renders SVG: nodes as circles, edges as lines,
// positioned via an in-order traversal (x = in-order index, y = depth).

let treeRoot = null;

function computeTreeLayout() {
    let counter = 0;
    const nodes = [];

    function inorder(node, depth) {
        if (!node) return;
        inorder(node.left, depth + 1);
        node._x = counter++;
        node._y = depth;
        nodes.push(node);
        inorder(node.right, depth + 1);
    }

    inorder(treeRoot, 0);
    return nodes;
}

function renderTree(highlightPath = [], foundValue = null) {
    const container = document.getElementById('visualizer-container');
    if (!container) return;

    container.classList.remove('stack-mode', 'queue-mode');
    container.classList.add('tree-mode');
    container.innerHTML = '';

    if (!treeRoot) {
        const empty = document.createElement('div');
        empty.classList.add('empty-structure-msg');
        empty.innerText = 'Tree is empty — insert a value to begin';
        container.appendChild(empty);
        return;
    }

    const nodes = computeTreeLayout();
    const n = nodes.length;
    const xSpacing = 66;
    const ySpacing = 74;
    const maxDepth = Math.max(...nodes.map(nd => nd._y));

    const svgWidth = Math.max(320, (n - 1) * xSpacing + 80);
    const svgHeight = (maxDepth + 1) * ySpacing + 50;
    const xOffset = n > 1 ? (svgWidth - (n - 1) * xSpacing) / 2 : svgWidth / 2;

    nodes.forEach(node => {
        node._px = n > 1 ? xOffset + node._x * xSpacing : svgWidth / 2;
        node._py = 36 + node._y * ySpacing;
    });

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.classList.add('tree-svg');

    // Edges first so node circles render on top of the lines
    nodes.forEach(node => {
        ['left', 'right'].forEach(side => {
            const child = node[side];
            if (!child) return;
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', node._px);
            line.setAttribute('y1', node._py);
            line.setAttribute('x2', child._px);
            line.setAttribute('y2', child._py);
            line.classList.add('tree-edge');
            svg.appendChild(line);
        });
    });

    nodes.forEach(node => {
        const g = document.createElementNS(svgNS, 'g');
        g.classList.add('tree-node');
        if (highlightPath.includes(node)) g.classList.add('comparing');
        if (foundValue !== null && node.value === foundValue) g.classList.add('found');

        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', node._px);
        circle.setAttribute('cy', node._py);
        circle.setAttribute('r', 22);
        g.appendChild(circle);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', node._px);
        text.setAttribute('y', node._py);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.textContent = node.value;
        g.appendChild(text);

        svg.appendChild(g);
    });

    container.appendChild(svg);
}

async function insertNode(value) {
    const statusBar = document.getElementById('status-bar');

    if (treeRoot === null) {
        treeRoot = { value, left: null, right: null };
        renderTree([], value);
        statusBar.className = 'status-message success';
        statusBar.innerText = `Inserted ${value} as the root`;
        return;
    }

    let current = treeRoot;
    const path = [];

    while (current) {
        path.push(current);
        renderTree(path);
        statusBar.className = 'status-message searching';
        statusBar.innerText = `Comparing ${value} with ${current.value}...`;
        await sleep(getSpeed());

        if (value === current.value) {
            statusBar.className = 'status-message error';
            statusBar.innerText = `${value} already exists in the tree`;
            return;
        }

        if (value < current.value) {
            if (!current.left) {
                current.left = { value, left: null, right: null };
                renderTree(path, value);
                statusBar.className = 'status-message success';
                statusBar.innerText = `Inserted ${value} as the left child of ${current.value}`;
                return;
            }
            current = current.left;
        } else {
            if (!current.right) {
                current.right = { value, left: null, right: null };
                renderTree(path, value);
                statusBar.className = 'status-message success';
                statusBar.innerText = `Inserted ${value} as the right child of ${current.value}`;
                return;
            }
            current = current.right;
        }
    }
}

async function searchTree(value) {
    const statusBar = document.getElementById('status-bar');

    if (!treeRoot) {
        statusBar.className = 'status-message error';
        statusBar.innerText = 'Tree is empty — nothing to search';
        return null;
    }

    let current = treeRoot;
    const path = [];

    while (current) {
        path.push(current);
        renderTree(path);
        statusBar.className = 'status-message searching';
        statusBar.innerText = `Comparing ${value} with ${current.value}...`;
        await sleep(getSpeed());

        if (value === current.value) {
            renderTree(path, value);
            statusBar.className = 'status-message success';
            statusBar.innerText = `Found ${value}!`;
            return current;
        }

        current = value < current.value ? current.left : current.right;
    }

    renderTree(path);
    statusBar.className = 'status-message error';
    statusBar.innerText = `${value} not found in the tree`;
    return null;
}

function clearTree() {
    treeRoot = null;
    renderTree();
    const statusBar = document.getElementById('status-bar');
    if (statusBar) statusBar.className = 'status-message hidden';
}