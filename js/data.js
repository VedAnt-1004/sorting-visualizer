data.js

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
        type: "search",
        description: "Linear search is the simplest searching algorithm. It sequentially checks each element of the list until a match is found or the whole list has been searched. It is reliable but slow for massive datasets.",
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