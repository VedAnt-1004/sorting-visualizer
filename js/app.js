// --- js/app.js ---

const container = document.getElementById('visualization-container');
const generateBtn = document.getElementById('generate-btn');
const sizeSpeedSlider = document.getElementById('array-size');
const algoButtons = document.querySelectorAll('.algo-btn');

let array = [];
let delay = 250; 

function generateArray() {
    array = [];
    container.innerHTML = ''; 
    const noOfBars = parseInt(sizeSpeedSlider.value);
    const barWidth = (100 / noOfBars) - 0.2; 

    for (let i = 0; i < noOfBars; i++) {
        const value = Math.floor(Math.random() * 390) + 10;
        array.push(value);
        const bar = document.createElement('div');
        bar.classList.add('array-bar');
        bar.style.height = `${value}px`;
        bar.style.width = `${barWidth}%`;
        bar.innerText = value;
        container.appendChild(bar);
        
    
    }
}

// --- Custom Array Logic ---
const customInput = document.getElementById('custom-array');
const loadCustomBtn = document.getElementById('load-custom-btn');

function loadCustomArray() {
    const val = customInput.value;
    if (!val) return;

    // Convert string "10, 20, 30" into an array of integers [10, 20, 30]
    const stringArr = val.split(',');
    let numArr = stringArr.map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    
    if (numArr.length === 0) return;

    // Reset UI
    array = [];
    container.innerHTML = '';
    
    // Find the maximum value to scale the heights perfectly on screen
    const maxVal = Math.max(...numArr);
    const barWidth = (100 / numArr.length) - 0.2;

    numArr.forEach(num => {
        // 1. Push the REAL number into the engine
        array.push(num); 
        
        // 2. Compute visual height
        const scaledHeight = Math.floor(Math.max((num / maxVal) * 390, 10)); 
        
        // 3. Draw the HTML bar
        const bar = document.createElement('div');
        bar.classList.add('array-bar');
        bar.style.height = `${scaledHeight}px`;
        bar.style.width = `${barWidth}%`;
        bar.innerText = num; // Stamp the real number
        container.appendChild(bar);
    });

    // Sync slider visually
    sizeSpeedSlider.value = numArr.length;
    updateSpeed();
}

// Listen for the Load button or the "Enter" key
loadCustomBtn.addEventListener('click', loadCustomArray);
customInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadCustomArray();
});

function updateSpeed() {
    const noOfBars = parseInt(sizeSpeedSlider.value);
    delay = 10000 / (Math.pow(noOfBars, 2)); 
}

function disableControls() {
    generateBtn.disabled = true;
    sizeSpeedSlider.disabled = true;
    algoButtons.forEach(btn => btn.disabled = true);
    customInput.disabled = true;
    loadCustomBtn.disabled = true;
}

function enableControls() {
    generateBtn.disabled = false;
    sizeSpeedSlider.disabled = false;
    algoButtons.forEach(btn => btn.disabled = false);
    customInput.disabled = false;
    loadCustomBtn.disabled = false;
}

// --- Dashboard Logic ---
const algoInfo = {
    'bubble': { name: 'Bubble Sort', tcWorst: 'O(n²)', tcAvg: 'O(n²)', tcBest: 'O(n)', scWorst: 'O(1)' },
    'merge': { name: 'Merge Sort', tcWorst: 'O(n log n)', tcAvg: 'O(n log n)', tcBest: 'O(n log n)', scWorst: 'O(n)' },
    'quick': { name: 'Quick Sort', tcWorst: 'O(n²)', tcAvg: 'O(n log n)', tcBest: 'O(n log n)', scWorst: 'O(log n)' }
};

const infoPanel = document.getElementById('info-panel');
const liveComparisons = document.getElementById('live-comparisons');
const liveSwaps = document.getElementById('live-swaps');

function updateDashboard(algoType) {
    infoPanel.classList.remove('hidden');
    const info = algoInfo[algoType];
    document.getElementById('algo-title').innerText = info.name;
    document.getElementById('tc-worst').innerText = info.tcWorst;
    document.getElementById('tc-best').innerText = info.tcBest;
    liveComparisons.innerText = '0';
    liveSwaps.innerText = '0';
}

// --- Code Highlighting Database ---
const algoCode = {
    'bubble': [
        "for (int i = 0; i < n - 1; i++) {",              
        "    let swapped = false;",                       
        "    for (int j = 0; j < n - i - 1; j++) {",      
        "        if (arr[j] > arr[j + 1]) {",             
        "            swap(arr[j], arr[j + 1]);",          
        "            swapped = true;",                    
        "        }",                                      
        "    }",                                          
        "    if (!swapped) break;",                       
        "}"                                               
    ],
    'merge': [
        "void mergeSort(arr, l, r) {",           
        "    if (l >= r) return;",               
        "    int m = l + (r - l) / 2;",          
        "    mergeSort(arr, l, m);",             
        "    mergeSort(arr, m + 1, r);",         
        "    merge(arr, l, m, r);",              
        "}"                                      
    ],
    'quick': [
        "void quickSort(arr, low, high) {",      
        "    if (low < high) {",                 
        "        int pi = partition(arr, low, high);", 
        "        quickSort(arr, low, pi - 1);",  
        "        quickSort(arr, pi + 1, high);", 
        "    }",                                 
        "}"                                      
    ]
};

const codePanel = document.getElementById('code-panel');
const codeBlock = document.getElementById('code-block');

function renderCode(algoType) {
    codePanel.classList.remove('hidden');
    codeBlock.innerHTML = ''; 
    const lines = algoCode[algoType];
    
    lines.forEach((lineText, index) => {
        const lineElement = document.createElement('span');
        lineElement.classList.add('code-line');
        lineElement.id = `code-line-${index}`; 
        lineElement.innerHTML = lineText.replace(/ /g, '&nbsp;'); 
        codeBlock.appendChild(lineElement);
    });
}

function highlightLine(lineNumber) {
    const allLines = document.querySelectorAll('.code-line');
    allLines.forEach(line => line.classList.remove('active-line'));
    if (lineNumber !== undefined && lineNumber !== null) {
        const targetLine = document.getElementById(`code-line-${lineNumber}`);
        if (targetLine) targetLine.classList.add('active-line');
    }
}

generateBtn.addEventListener('click', generateArray);
sizeSpeedSlider.addEventListener('input', () => { generateArray(); updateSpeed(); });
window.onload = () => { generateArray(); updateSpeed(); };