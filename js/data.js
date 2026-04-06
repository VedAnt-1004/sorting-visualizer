
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
    }

    /* ==========================================
       2. SORTING ALGORITHMS
       ========================================== */

    // --- 2.1 O(n^2) Simple Sorts --- //
       
    // "bubble-sort": { ... },
    // "selection-sort": { ... },

    // --- 2.2 O(n log n) Fast Sorts --- //

    // "merge-sort": { ... },
    // "quick-sort": { ... },

};