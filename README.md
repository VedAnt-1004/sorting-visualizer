# AlgoVision

An interactive Data Structures and Algorithms visualizer designed to turn abstract algorithm logic into an inspectable, step-by-step debugging experience.

🔗 **[Live Demo](https://sorting-visualizer-sable-rho.vercel.app/)**

---

## 📌 Overview

**AlgoVision** is a web-based educational workspace for running, inspecting, and analyzing algorithms and data structures in real time. Unlike conventional visualizers that run automated animations on fixed timer loops, AlgoVision gives users full execution control: pause, step forward, step backward, and trace the active line of code across execution phases.

---

## ❓ The Problem It Solves

* **No Stepping Backward:** Most web visualizers use blocking sleep/timeout loops, making it impossible to step back to inspect an edge case without restarting the entire execution[cite: 1].
* **Code Disconnect:** Visual state changes on screen often feel disconnected from the underlying source code[cite: 1].
* **Rigid Architectures:** Mixing animation DOM logic directly into algorithm loops makes adding new data structures error-prone[cite: 1].

AlgoVision resolves this with pure generator-driven state snapshots, bidirectional execution scrubbing, and synchronized multi-language line tracking[cite: 1].

---

## 🚀 Supported Modules & Features

| Category | Algorithm / Structure | Operations / Mode | Rendering Engine | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Search** | Linear Search, Binary Search[cite: 5] | Step-by-step target search with active bounds[cite: 5, 7] | DOM Array Blocks[cite: 6] | $O(n)$, $O(\log n)$[cite: 5] | $O(1)$[cite: 5] |
| **Sort** | Bubble, Selection, Insertion, Merge, Quick[cite: 5, 8] | Step-by-step comparison, swap, and partition tracing[cite: 8] | DOM Array Blocks[cite: 6] | $O(n^2)$ to $O(n \log n)$[cite: 5] | $O(1)$ to $O(n)$[cite: 5] |
| **Stack** | LIFO Stack[cite: 5] | Live interactive Push, Pop, Peek, Clear[cite: 10] | Vertical Flexbox (`.stack-mode`)[cite: 3, 10] | $O(1)$ per op[cite: 5] | $O(n)$[cite: 5] |
| **Queue** | FIFO Queue[cite: 5] | Live interactive Enqueue, Dequeue, Peek, Clear[cite: 9] | Horizontal Flexbox (`.queue-mode`)[cite: 3, 9] | $O(1)$ per op[cite: 5] | $O(n)$[cite: 5] |
| **Tree** | Binary Search Tree (BST)[cite: 1] | Insert, Search, 3-Case Delete, In/Pre/Post Traversals[cite: 1] | Dynamic SVG (In-order coordinate mapping)[cite: 1] | $O(h)$ | $O(n)$[cite: 5] |
| **Graph** | Undirected Graph (Adjacency List)[cite: 1] | Add Node, Add Edge, Animated BFS/DFS, Random Graph[cite: 1] | Dynamic SVG (Circular trigonometric layout)[cite: 1] | $O(V + E)$[cite: 1] | $O(V)$[cite: 1] |

---

## ⚙️ Technical Architecture

* **Generator State Isolation:** Algorithms are implemented as ES6 generator functions (`function*`) yielding discrete immutable snapshots (`{ array, highlights, message, statusClass, phase }`) without touching the DOM[cite: 1, 6, 8].
* **$O(1)$ Bidirectional Scrubbing:** The `StepPlayer` engine caches step snapshots as they are generated[cite: 6]. Stepping backward (`Prev`) retrieves cached state in $O(1)$ time without recalculating state or rewinding loops[cite: 1, 6].
* **Deterministic Layout Math:**
  * **Binary Search Tree:** Node coordinates are computed dynamically via in-order index ($x$) and recursion depth ($y$), preventing edge crossovers without external layout engines[cite: 1].
  * **Graph:** Nodes are mapped evenly across a circular layout using dynamic trigonometric offsets ($(r \cos \theta, r \sin \theta)$) to guarantee edge visibility across arbitrary node counts[cite: 1].
* **Zero External Dependencies:** Built with pure vanilla Web APIs (DOM, SVG NS, ES6 JavaScript, CSS Grid/Flexbox) for instant load times and zero dependency overhead[cite: 1, 2, 3].
* **Responsive Architecture:** Custom media queries (`900px`, `480px`) collapse navigation and convert fixed-width visualizer arenas into scroll-safe surfaces on tablet and mobile viewports[cite: 1, 3].

---

## 📂 Project Structure

```text
algovision/
├── index.html                 # Single-page application shell and screen routing
├── style.css                  # Theme tokens, visualizer layout rules, and media queries
└── js/
    ├── app.js                 # UI controller, workspace setup, and event delegation
    ├── data.js                # Algorithm database, complexities, code snippets, line maps
    ├── visualizer.js          # Shared StepPlayer engine and delay timers
    ├── algorithms/
    │   ├── search.js          # Generator-based search algorithms
    │   └── sorting.js         # Generator-based sorting algorithms
    └── structures/
        ├── stack.js           # Live LIFO stack engine
        ├── queue.js           # Live FIFO queue engine
        ├── tree.js            # Live SVG BST engine with traversals & deletion
        └── graph.js           # Live SVG Graph engine with BFS/DFS

## 🛠️ Local Setup & Quickstart
No build steps or package managers required.

# 1. Clone the repository
git clone [https://github.com/your-username/algovision.git](https://github.com/your-username/algovision.git)

# 2. Navigate to project directory
cd algovision

# 3. Serve using any static server (or open index.html directly)
npx serve .

🤝 Contributing
Contributions are welcome! To add a new algorithm or data structure:

Fork the repository.

Create a feature branch:
git checkout -b feature/your-feature-name

Implement your changes:

Step algorithms: add generators to js/algorithms/

Persistent structures: add interactive engines to js/structures/

Database & Snippets: register metadata, multi-language snippets, and line maps in js/data.js


Test locally: Open index.html in a web browser to verify step execution, visualizer layout, and responsive mobile behavior[cite: 1].

Commit and open a Pull Request.