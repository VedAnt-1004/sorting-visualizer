# AlgoVision

An interactive Data Structures and Algorithms visualizer designed to turn abstract algorithm logic into an inspectable, step-by-step debugging experience[cite: 2, 4].

🔗 **[Live App](sorting-visualizer-sable-rho.vercel.app)**


---

## 📌 Overview

**AlgoVision** is a web-based educational workspace for running, inspecting, and analyzing algorithms in real time[cite: 2]. Unlike conventional visualizers that run automated animations on fixed timers, AlgoVision lets users pause, step forward, step backward, and see the exact line of code executing at each stage[cite: 4, 6, 7, 8].

---

## ❓ The Problem It Solves

* **No Stepping Backward:** Most web visualizers use blocking sleep/timeout loops, making it difficult to step back to a previous state or inspect an edge case without restarting from zero[cite: 6].
* **Code Disconnect:** Visual state changes on screen often feel disconnected from the underlying source code[cite: 4, 7, 8].

AlgoVision bridges this gap with bidirectional execution controls and live line-by-line code highlighting[cite: 4, 6, 7, 8].

---

## ⚙️ How It Works

* **Pure State Generators:** Algorithms are built as ES6 generator functions (`function*`) yielding discrete state snapshots without touching the DOM[cite: 6, 7, 8].
* **StepPlayer Engine:** A central playback manager caches evaluated steps, enabling instantaneous bidirectional (`Prev` / `Next`) navigation[cite: 4, 6].
* **Synchronized Highlighting:** Semantic phase tags map each visual change directly to its corresponding line in the code view[cite: 4, 5, 6].

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name

1. Add your changes (algorithms go in js/algorithms/, configurations in js/data.js).  
2. Open index.html locally to test your updates.  
3. Commit and open a Pull Request.
