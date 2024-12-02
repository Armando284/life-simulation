# Life Simulation with JavaScript and Canvas

This project is a simulation built with vanilla JavaScript and Canvas, representing a virtual society where each "Sim" has genetic interests, makes decisions, and lives a limited life while facing challenges like studying, working, finding a partner, and raising offspring.  

---

## Features

- **Dynamic longevity**: Each Sim can live up to 100 years, with increasing probabilities of dying over time.
- **Genetic interests**: Sims inherit genetic values that determine their interest in studying and working.
- **Education and work**: Sims can study to improve their job opportunities, but they must balance these activities based on their interests and economic needs.
- **Relationships and reproduction**: Sims seek partners based on criteria such as education, income, and compatibility, and they can reproduce to extend their lineage.
- **Random events**: Unexpected events like illnesses or changes in interests add an element of unpredictability.
- **Economic dynamics**: Each Sim has financial needs that must be met through work or parental support.

---

## Simulator Rules

### 1. General
- Each Sim has a maximum life expectancy of 100 years.
- The probability of death increases incrementally each year.

### 2. Education
- Sims can study at school, increasing their education level each year.
- Studying and working simultaneously requires a high interest in working (>70).

### 3. Work
- Sims can start working at the age of 18.
- Income depends on their education level and determines if they can cover their living expenses.

### 4. Relationships and Reproduction
- Sims seek partners starting at the age of 20.
- Couples have requirements regarding education and income to be compatible.
- Couples can have children if they have sufficient savings.

### 5. Genetics
- Interests in studying and working are genetic values inherited with random variations.
- These interests influence the Sim’s decisions throughout their life.

---

## Project Requirements

- **Modern browser** with Canvas support.
- **Vanilla JavaScript** (no external libraries).

---

## Installation and Usage

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Armando284/life-simulation.git
   cd life-simulation
   ```

2. **Open the `index.html` file**:
   Simply open the file in a browser to run the simulation.

3. **Configure initial parameters**:
   You can adjust initial variables like population size, probabilities, and costs in the `config.js` file.

---

## Project Structure

```plaintext
life-simulation/
│
├── index.html        # Basic simulator interface.
├── main.js           # Core simulation logic.
├── sim.js            # Class to handle Sim entities.
├── config.js         # Initial configurations (population, costs, etc.).
├── style.css         # Basic styles for the canvas.
└── README.md         # Project documentation.
```

---

## Future Ideas

- **Graphical interface**: Add buttons and menus to pause/resume the simulation or adjust parameters in real time.
- **Complex event system**: Introduce more random events that affect Sims, such as natural disasters or technological advancements.
- **Genetic evolution**: Implement more advanced logic for genetic inheritance and its long-term impact.
- **Statistics**: Display data visualizations such as average age, income, or education levels.

---

## Contributions

Contributions are welcome! If you have ideas to improve the simulator, please open an *issue* or submit a *pull request*.  

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute it. 😊

--- 