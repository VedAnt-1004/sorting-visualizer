# AlgoVision

An interactive Data Structures and Algorithms visualizer designed to turn abstract algorithm logic into an inspectable, step-by-step debugging experience.

🔗 **[Live App](sorting-visualizer-sable-rho.vercel.app)**

---

## 📌 Overview

**AlgoVision** is a web-based educational workspace for running, inspecting, and analyzing algorithms in real time. Unlike conventional visualizers that run automated animations on fixed timers, AlgoVision lets users pause, step forward, step backward, and see the exact line of code executing at each stage.

---

## ❓ The Problem It Solves

* **No Stepping Backward:** Most web visualizers use blocking sleep/timeout loops, making it difficult to step back to a previous state or inspect an edge case without restarting from zero.
* **Code Disconnect:** Visual state changes on screen often feel disconnected from the underlying source code.

AlgoVision bridges this gap with bidirectional execution controls and live line-by-line code highlighting.

---

## ⚙️ How It Works

* **Pure State Generators:** Algorithms are built as ES6 generator functions (`function*`) yielding discrete state snapshots without touching the DOM.
* **StepPlayer Engine:** A central playback manager caches evaluated steps, enabling instantaneous bidirectional (`Prev` / `Next`) navigation.
* **Synchronized Highlighting:** Semantic phase tags map each visual change directly to its corresponding line in the code view.

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
