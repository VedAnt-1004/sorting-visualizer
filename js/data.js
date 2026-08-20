
// ==========================================
// ALGORITHM ENCYCLOPEDIA (js/data.js)
// ==========================================

const algorithmDatabase = {

    /* ==========================================
       1. SEARCHING ALGORITHMS
       ========================================== */

    // --- 1.1 Sequential Searches --- //

    "linear-search": {
        title: "Linear Search",
        category: "array",
        type: "search",
        description: "Imagine you have a list of numbers: [5, 3, 8, 1, 9] and you want to find the number 8.\n\n1. Start from the first number (5). Is 5 equal to 8? No.\n\n2. Move to the next number (3). Is 3 equal to 8? No.\n\n3. Move to the next number (8). Is 8 equal to 8? Yes! Stop here.\n\n4. The position is 2 (or 3 if counting starts from 1).\n\nIf the number is not in the list (e.g., searching for 10), the search ends without success.",
        lineMap: { javascript: { start: 2, checking: 3, found: 4, 'not-found': 7 } },
        complexities: { worst: "O(n)", space: "O(1)" },
        code: {
            javascript: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i; // Target found
        }
    }
    return -1; // Target not found
}`,
            python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i # Target found
    return -1 # Target not found`,
            cpp: `int linearSearch(int arr[], int size, int target) {
    for (int i = 0; i < size; i++) {
        if (arr[i] == target) {
            return i; // Target found
        }
    }
    return -1; // Target not found
}`
        }
    },

    // --- 1.2 Divide & Conquer Searches --- //

    "binary-search": {
        title: "Binary Search",
        category: "array",
        type: "search",
        description: "Binary Search is a highly efficient algorithm that works by repeatedly dividing the search space in half. It compares the target value to the middle element of the array. NOTE: The array must be strictly sorted for this to work!",
        lineMap: { javascript: { start: 2, checking: 6, found: 8, 'discard-left': 9, 'discard-right': 10, 'not-found': 12 } },
        complexities: { worst: "O(log n)", space: "O(1)" },
        code: {
            javascript: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
            python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1`,
            cpp: `int binarySearch(int arr[], int size, int target) {
    int left = 0;
    int right = size - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
        }
    },

    /* ==========================================
       2. SORTING ALGORITHMS
       ========================================== */

    // --- 2.1 O(n^2) Simple Sorts --- //

    "bubble-sort": {
        title: "Bubble Sort",
        category: "array",
        type: "sorting",
        description: "Bubble Sort repeatedly steps through the array, compares each pair of adjacent elements, and swaps them if they're in the wrong order.\n\n1. Compare the first two elements. If the left one is bigger, swap them.\n\n2. Move to the next pair and repeat.\n\n3. After one full pass, the largest element has 'bubbled up' to the end.\n\n4. Repeat the whole pass, ignoring the already-sorted tail, until no swaps are needed.\n\nIt's simple to understand but inefficient on large lists.",
        lineMap: { javascript: { start: 2, compare: 5, swap: 6, done: 10 } },
        complexities: { worst: "O(n²)", space: "O(1)" },
        code: {
            javascript: `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
            python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
            cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`
        }
    },

    "selection-sort": {
        title: "Selection Sort",
        category: "array",
        type: "sorting",
        description: "Selection Sort divides the array into a sorted part and an unsorted part.\n\n1. Find the smallest element in the unsorted part.\n\n2. Swap it with the first element of the unsorted part.\n\n3. Move the boundary between sorted and unsorted forward by one.\n\n4. Repeat until the whole array is sorted.\n\nIt always does the same number of comparisons regardless of input order.",
        lineMap: { javascript: { start: 2, 'assume-min': 4, compare: 6, 'new-min': 7, swap: 11, done: 14 } },
        complexities: { worst: "O(n²)", space: "O(1)" },
        code: {
            javascript: `function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}`,
            python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
            cpp: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        swap(arr[i], arr[minIdx]);
    }
}`
        }
    },

    "insertion-sort": {
        title: "Insertion Sort",
        category: "array",
        type: "sorting",
        description: "Insertion Sort builds the sorted array one element at a time, like sorting playing cards in your hand.\n\n1. Start with the second element as the 'key'.\n\n2. Compare it to elements before it, shifting larger ones to the right.\n\n3. Insert the key into its correct position in the sorted portion.\n\n4. Move to the next element and repeat.\n\nIt's efficient for small or nearly-sorted arrays.",
        lineMap: { javascript: { start: 2, 'pick-key': 3, 'compare-shift': 5, shift: 6, insert: 9, done: 11 } },
        complexities: { worst: "O(n²)", space: "O(1)" },
        code: {
            javascript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
            python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
            cpp: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
        }
    },

    // --- 2.2 O(n log n) Fast Sorts --- //

    // "merge-sort": { ... },
    // "quick-sort": { ... },

};
