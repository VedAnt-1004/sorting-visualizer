
// ==========================================
// SEARCH ALGORITHMS ENGINE (js/algorithms/search.js)
// ==========================================
// Generators, same contract as sorting.js — see that file's header comment.

function* linearSearchSteps(inputArr, target) {
    const arr = [...inputArr];

    yield { array: [...arr], highlights: {}, message: `Searching for ${target}...`, statusClass: 'searching' };

    for (let i = 0; i < arr.length; i++) {
        yield { array: [...arr], highlights: { current: [i] }, message: `Checking index [${i}]: is ${arr[i]} equal to ${target}?`, statusClass: 'searching' };

        if (arr[i] === target) {
            yield { array: [...arr], highlights: { found: i }, message: `Element ${target} found at index [${i}]!`, statusClass: 'success' };
            return;
        }
    }

    yield { array: [...arr], highlights: {}, message: `Element ${target} not found in the array.`, statusClass: 'error' };
}

function* binarySearchSteps(inputArr, target) {
    const arr = [...inputArr];

    yield { array: [...arr], highlights: {}, message: `Starting Binary Search for ${target}...`, statusClass: 'searching' };

    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const dimmed = [];
        for (let i = 0; i < arr.length; i++) {
            if (i < left || i > right) dimmed.push(i);
        }

        yield {
            array: [...arr],
            highlights: { current: [mid], dimmed },
            message: `Checking middle element at index [${mid}]: is ${arr[mid]} equal to ${target}?`,
            statusClass: 'searching'
        };

        if (arr[mid] === target) {
            yield { array: [...arr], highlights: { found: mid, dimmed }, message: `Element ${target} found at index [${mid}]!`, statusClass: 'success' };
            return;
        }

        if (arr[mid] < target) {
            left = mid + 1;
            yield {
                array: [...arr],
                highlights: { dimmed: dimmed.concat(mid) },
                message: `${arr[mid]} is too small. Discarding left half.`,
                statusClass: 'searching'
            };
        } else {
            right = mid - 1;
            yield {
                array: [...arr],
                highlights: { dimmed: dimmed.concat(mid) },
                message: `${arr[mid]} is too big. Discarding right half.`,
                statusClass: 'searching'
            };
        }
    }

    yield { array: [...arr], highlights: {}, message: `Element ${target} not found.`, statusClass: 'error' };
}
