// ==========================================
// SORTING ALGORITHMS ENGINE (js/algorithms/sorting.js)
// ==========================================
// Each function below is a GENERATOR (function*). It doesn't touch the DOM
// or sleep() at all — it just yields a snapshot object after every
// meaningful step. A StepPlayer (see visualizer.js) pulls from it, whether
// that's for autoplay or manual Next/Prev stepping.
//
// Step shape: { array, highlights, message, statusClass }

function* bubbleSortSteps(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const sortedIdx = [];

    yield { array: [...arr], highlights: {}, message: 'Starting Bubble Sort...', statusClass: 'searching' };

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            yield {
                array: [...arr],
                highlights: { comparing: [j, j + 1], sorted: [...sortedIdx] },
                message: `Comparing ${arr[j]} and ${arr[j + 1]}...`,
                statusClass: 'searching'
            };

            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                yield {
                    array: [...arr],
                    highlights: { comparing: [j, j + 1], sorted: [...sortedIdx] },
                    message: `Swapped ${arr[j + 1]} and ${arr[j]}`,
                    statusClass: 'searching'
                };
            }
        }
        sortedIdx.push(n - i - 1);
    }
    sortedIdx.push(0);

    yield { array: [...arr], highlights: { sorted: [...sortedIdx] }, message: 'Array sorted!', statusClass: 'success' };
}

function* selectionSortSteps(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;
    const sortedIdx = [];

    yield { array: [...arr], highlights: {}, message: 'Starting Selection Sort...', statusClass: 'searching' };

    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        yield { array: [...arr], highlights: { current: [minIdx], sorted: [...sortedIdx] }, message: `Assuming ${arr[i]} is the minimum...`, statusClass: 'searching' };

        for (let j = i + 1; j < n; j++) {
            yield {
                array: [...arr],
                highlights: { current: [minIdx], comparing: [j], sorted: [...sortedIdx] },
                message: `Comparing ${arr[j]} with current minimum ${arr[minIdx]}...`,
                statusClass: 'searching'
            };

            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                yield {
                    array: [...arr],
                    highlights: { current: [minIdx], sorted: [...sortedIdx] },
                    message: `New minimum found: ${arr[minIdx]}`,
                    statusClass: 'searching'
                };
            }
        }

        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            yield {
                array: [...arr],
                highlights: { current: [i], sorted: [...sortedIdx] },
                message: `Swapped ${arr[i]} into position ${i}`,
                statusClass: 'searching'
            };
        }

        sortedIdx.push(i);
    }
    sortedIdx.push(n - 1);

    yield { array: [...arr], highlights: { sorted: [...sortedIdx] }, message: 'Array sorted!', statusClass: 'success' };
}

function* insertionSortSteps(inputArr) {
    const arr = [...inputArr];
    const n = arr.length;

    yield { array: [...arr], highlights: { sorted: [0] }, message: 'Starting Insertion Sort...', statusClass: 'searching' };

    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        const sortedSoFar = () => Array.from({ length: i }, (_, k) => k);

        yield {
            array: [...arr],
            highlights: { current: [i], sorted: sortedSoFar() },
            message: `Picking up ${key} to insert into the sorted portion...`,
            statusClass: 'searching'
        };

        while (j >= 0 && arr[j] > key) {
            yield {
                array: [...arr],
                highlights: { comparing: [j], current: [i], sorted: sortedSoFar() },
                message: `${arr[j]} > ${key}, shifting it right...`,
                statusClass: 'searching'
            };

            arr[j + 1] = arr[j];
            j--;

            yield {
                array: [...arr],
                highlights: { sorted: sortedSoFar() },
                message: `Shifted. Continuing to compare...`,
                statusClass: 'searching'
            };
        }

        arr[j + 1] = key;

        yield {
            array: [...arr],
            highlights: { sorted: Array.from({ length: i + 1 }, (_, k) => k) },
            message: `Inserted ${key} at position ${j + 1}`,
            statusClass: 'searching'
        };
    }

    yield { array: [...arr], highlights: { sorted: Array.from({ length: n }, (_, k) => k) }, message: 'Array sorted!', statusClass: 'success' };
}