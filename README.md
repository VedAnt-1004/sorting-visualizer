# AlgoVision

An interactive Data Structures and Algorithms visualizer designed to turn abstract algorithm logic into an inspectable, step-by-step debugging experience.

🔗 **[Live Demo](https://sorting-visualizer-sable-rho.vercel.app/)**

---

## 📌 Overview

**AlgoVision** is a web-based educational workspace for running, inspecting, and analyzing algorithms and data structures in real time. Unlike conventional visualizers that run automated animations on fixed timer loops, AlgoVision gives users full execution control: pause, step forward, step backward, and trace the active line of code across execution phases.

---

## ❓ The Problem It Solves

* **No Stepping Backward:** Most web visualizers use blocking sleep/timeout loops, making it impossible to step back to inspect an edge case without restarting the entire execution.
* **Code Disconnect:** Visual state changes on screen often feel disconnected from the underlying source code.
* **Rigid Architectures:** Mixing animation DOM logic directly into algorithm loops makes adding new data structures error-prone.

AlgoVision resolves this with pure generator-driven state snapshots, bidirectional execution scrubbing, and synchronized multi-language line tracking.

---

## 🚀 Supported Modules & Features

| Category | Algorithm / Structure | Operations / Mode | Rendering Engine | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Search** | Linear Search, Binary Search | Step-by-step target search with active bounds | DOM Array Blocks | $O(n)$, $O(\log n)$ | $O(1)$ |
| **Sort** | Bubble, Selection, Insertion, Merge, Quick | Step-by-step comparison, swap, and partition tracing | DOM Array Blocks | $O(n^2)$ to $O(n \log n)$ | $O(1)$ to $O(n)$ |
| **Stack** | LIFO Stack | Live interactive Push, Pop, Peek, Clear | Vertical Flexbox (`.stack-mode`) | $O(1)$ per op | $O(n)$ |
| **Queue** | FIFO Queue | Live interactive Enqueue, Dequeue, Peek, Clear | Horizontal Flexbox (`.queue-mode`) | $O(1)$ per op | $O(n)$ |
| **Tree** | Binary Search Tree (BST) | Insert, Search, 3-Case Delete, In/Pre/Post Traversals | Dynamic SVG (In-order coordinate mapping) | $O(h)$ | $O(n)$ |
| **Graph** | Undirected Graph (Adjacency List) | Add Node, Add Edge, Animated BFS/DFS, Random Graph | Dynamic SVG (Circular trigonometric layout) | $O(V + E)$ | $O(V)$ |

---

## ⚙️ Technical Architecture

* **Generator State Isolation:** Algorithms are implemented as ES6 generator functions (`function*`) yielding discrete immutable snapshots (`{ array, highlights, message, statusClass, phase }`) without touching the DOM.
* **$O(1)$ Bidirectional Scrubbing:** The `StepPlayer` engine caches step snapshots as they are generated. Stepping backward (`Prev`) retrieves cached state in $O(1)$ time without recalculating state or rewinding loops.
* **Deterministic Layout Math:**
  * **Binary Search Tree:** Node coordinates are computed dynamically via in-order index ($x$) and recursion depth ($y$), preventing edge crossovers without external layout engines.
  * **Graph:** Nodes are mapped evenly across a circular layout using dynamic trigonometric offsets ($(r \cos \theta, r \sin \theta)$) to guarantee edge visibility across arbitrary node counts.
* **Zero External Dependencies:** Built with pure vanilla Web APIs (DOM, SVG NS, ES6 JavaScript, CSS Grid/Flexbox) for instant load times and zero dependency overhead.
* **Responsive Architecture:** Custom media queries (`900px`, `480px`) collapse navigation and convert fixed-width visualizer arenas into scroll-safe surfaces on tablet and mobile viewports.

---

## 📂 Project Structure

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

```bash
# 1. Clone the repository
git clone [https://github.com/your-username/algovision.git](https://github.com/your-username/algovision.git)

# 2. Navigate to project directory
cd algovision

# 3. Serve using any static server (or open index.html directly)
npx serve .

## 🤝 Contributing

Contributions are welcome! To add a new algorithm or data structure:

1. **Fork** the repository.
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name

3. **Implement your changes:**
   * **Step algorithms:** Add generators to `js/algorithms/`
   * **Persistent structures:** Add interactive engines to `js/structures/`
   * **Database & Snippets:** Register metadata, multi-language snippets, and line maps in `js/data.js`
4. **Test locally:** Open `index.html` in a web browser to verify step execution, visualizer layout, and responsive mobile behavior.
5. **Commit and open a Pull Request.**