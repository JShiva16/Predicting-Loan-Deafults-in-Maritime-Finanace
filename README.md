# Maritime Loan Default Prediction System
### Hybrid TDA + Machine Learning Framework 

---

## Project Structure

```
maritime_project/
├── app.py                        ← Flask backend (ML models + TDA)
├── maritime_loan_dataset.csv     ← Dataset (150 records, 13 features)
├── requirements.txt              ← Python dependencies
├── README.md                     ← This file
├── templates/
│   └── index.html                ← Main HTML page
└── static/
    ├── css/
    │   └── style.css             ← Styling
    └── js/
        └── main.js               ← Frontend logic
```

---

## Setup Instructions

### Step 1 — Install Python (if not installed)
Download from: https://www.python.org/downloads/
Make sure to check "Add Python to PATH" during installation.

### Step 2 — Open VS Code
Open the `maritime_project` folder in VS Code:
```
File → Open Folder → Select maritime_project
```

### Step 3 — Open Terminal in VS Code
```
Terminal → New Terminal
```

### Step 4 — Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 5 — Run the Application
```bash
python app.py
```

### Step 6 — Open in Browser
Go to: **http://127.0.0.1:5000**

---

## Features

| Page | Description |
|---|---|
| **Predict** | Enter company details and get loan default prediction |
| **Dataset** | Browse all 150 records with filtering |
| **TDA Metrics** | View topological network metrics and Pearson correlations |
| **About** | Framework pipeline and model performance from IEEE paper |

---

## ML Models Used
- Logistic Regression
- Decision Tree
- Random Forest
- XGBoost (simulated based on paper results)

## TDA Network Metrics
- Degree Centrality
- Betweenness Centrality
- Clustering Coefficient
- PageRank

## Dataset Features (13)
| Category | Features |
|---|---|
| Loan Term | Amount, Tenor, Balloon, Finance, Spread |
| Financial Strength | MVC, ACR, Leverage |
| Vessel Operation | DWT, Age, Fleet_Size, Experience |
| Market Condition | BDI |

