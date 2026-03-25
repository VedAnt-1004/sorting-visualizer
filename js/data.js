// ==========================================
// THE ALGORITHM VAULT (Data Storage)
// ==========================================

const algoData = {
    "linear-search": {
        title: "Linear Search",
        type: "search", // Tells our UI to load text boxes instead of sliders
        description: "Linear search is the simplest searching algorithm. It sequentially checks each element of the list until a match is found or the whole list has been searched.",
        steps: [
            "Start from the first element (index 0) of the array.",
            "Compare the current element with the target value.",
            "If it matches, return the current index.",
            "If it doesn't match, move to the next element.",
            "If you reach the end of the array without a match, return -1 (Not Found)."
        ],
        complexities: {
            best: "O(1)",
            average: "O(n)",
            worst: "O(n)",
            space: "O(1)"
        },
        code: {
            javascript: `function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) {\n      return i; // Target found\n    }\n  }\n  return -1; // Target not found\n}`,
            python: `def linear_search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i # Target found\n    return -1 # Target not found`,
            cpp: `int linearSearch(int arr[], int n, int target) {\n    for (int i = 0; i < n; i++) {\n        if (arr[i] == target)\n            return i; // Target found\n    }\n    return -1; // Target not found\n}`
        }
    }
    
    // We will easily add "bubble-sort", "binary-search", etc. right below this later!
};