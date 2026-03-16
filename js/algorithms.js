// --- js/algorithms.js ---

// 1. BUBBLE SORT
function getBubbleSortAnimations(array) {
    const animations = [];
    let auxArray = array.slice(); 
    let n = auxArray.length;
    let swapped;

    animations.push({ type: 'highlight', line: 0 }); 
    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        animations.push({ type: 'highlight', line: 1 });
        animations.push({ type: 'highlight', line: 2 }); 

        for (let j = 0; j < n - i - 1; j++) {
            animations.push({ type: 'compare', indices: [j, j + 1], line: 3 });
            if (auxArray[j] > auxArray[j + 1]) {
                animations.push({ type: 'swap', indices: [j, j + 1], heights: [auxArray[j + 1], auxArray[j]], line: 4 });
                let temp = auxArray[j];
                auxArray[j] = auxArray[j + 1];
                auxArray[j + 1] = temp;
                swapped = true;
                animations.push({ type: 'highlight', line: 5 }); 
            } else {
                animations.push({ type: 'revert', indices: [j, j + 1], line: 6 });
            }
        }
        animations.push({ type: 'sorted', index: n - i - 1, line: 7 });
        animations.push({ type: 'highlight', line: 8 }); 
        if (!swapped) break;
    }
    for (let k = 0; k < n; k++) animations.push({ type: 'sorted', index: k });
    animations.push({ type: 'highlight', line: null }); 
    return animations;
}

// 2. MERGE SORT
function getMergeSortAnimations(array) {
    const animations = [];
    if (array.length <= 1) return array;
    const auxiliaryArray = array.slice();
    animations.push({ type: 'highlight', line: 0 });
    mergeSortHelper(array, 0, array.length - 1, auxiliaryArray, animations);
    animations.push({ type: 'highlight', line: null });
    return animations;
}

function mergeSortHelper(mainArray, startIdx, endIdx, auxiliaryArray, animations) {
    animations.push({ type: 'highlight', line: 1 });
    if (startIdx === endIdx) return;
    const middleIdx = Math.floor((startIdx + endIdx) / 2);
    animations.push({ type: 'highlight', line: 2 });
    
    animations.push({ type: 'highlight', line: 3 });
    mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
    
    animations.push({ type: 'highlight', line: 4 });
    mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
    
    animations.push({ type: 'highlight', line: 5 });
    doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations) {
    let k = startIdx;
    let i = startIdx;
    let j = middleIdx + 1;
    while (i <= middleIdx && j <= endIdx) {
        animations.push({ type: 'compare', indices: [i, j], line: 5 });
        animations.push({ type: 'revert', indices: [i, j], line: 5 });
        if (auxiliaryArray[i] <= auxiliaryArray[j]) {
            animations.push({ type: 'overwrite', index: k, height: auxiliaryArray[i], line: 5 });
            mainArray[k++] = auxiliaryArray[i++];
        } else {
            animations.push({ type: 'overwrite', index: k, height: auxiliaryArray[j], line: 5 });
            mainArray[k++] = auxiliaryArray[j++];
        }
    }
    while (i <= middleIdx) {
        animations.push({ type: 'compare', indices: [i, i], line: 5 });
        animations.push({ type: 'revert', indices: [i, i], line: 5 });
        animations.push({ type: 'overwrite', index: k, height: auxiliaryArray[i], line: 5 });
        mainArray[k++] = auxiliaryArray[i++];
    }
    while (j <= endIdx) {
        animations.push({ type: 'compare', indices: [j, j], line: 5 });
        animations.push({ type: 'revert', indices: [j, j], line: 5 });
        animations.push({ type: 'overwrite', index: k, height: auxiliaryArray[j], line: 5 });
        mainArray[k++] = auxiliaryArray[j++];
    }
}

// 3. QUICK SORT
function getQuickSortAnimations(array) {
    const animations = [];
    let auxArray = array.slice();
    animations.push({ type: 'highlight', line: 0 });
    quickSortHelper(auxArray, 0, auxArray.length - 1, animations);
    animations.push({ type: 'highlight', line: null });
    return animations;
}

function quickSortHelper(auxArray, startIdx, endIdx, animations) {
    animations.push({ type: 'highlight', line: 1 });
    if (startIdx < endIdx) {
        animations.push({ type: 'highlight', line: 2 });
        let pivotIdx = partition(auxArray, startIdx, endIdx, animations);
        
        animations.push({ type: 'highlight', line: 3 });
        quickSortHelper(auxArray, startIdx, pivotIdx - 1, animations);
        
        animations.push({ type: 'highlight', line: 4 });
        quickSortHelper(auxArray, pivotIdx + 1, endIdx, animations);
    } else if (startIdx === endIdx) {
        animations.push({ type: 'sorted', index: startIdx, line: 1 });
    }
}

function partition(auxArray, startIdx, endIdx, animations) {
    let pivotValue = auxArray[endIdx];
    let pivotIdx = startIdx;
    animations.push({ type: 'pivot', index: endIdx, line: 2 });

    for (let i = startIdx; i < endIdx; i++) {
        animations.push({ type: 'compare', indices: [i, endIdx], line: 2 });
        animations.push({ type: 'revert', indices: [i, endIdx], line: 2 });
        if (auxArray[i] < pivotValue) {
            animations.push({ type: 'swap', indices: [i, pivotIdx], heights: [auxArray[pivotIdx], auxArray[i]], line: 2 });
            let temp = auxArray[i];
            auxArray[i] = auxArray[pivotIdx];
            auxArray[pivotIdx] = temp;
            pivotIdx++;
        }
    }
    animations.push({ type: 'swap', indices: [pivotIdx, endIdx], heights: [auxArray[endIdx], auxArray[pivotIdx]], line: 2 });
    let temp = auxArray[pivotIdx];
    auxArray[pivotIdx] = auxArray[endIdx];
    auxArray[endIdx] = temp;

    animations.push({ type: 'sorted', index: pivotIdx, line: 2 });
    return pivotIdx;
}