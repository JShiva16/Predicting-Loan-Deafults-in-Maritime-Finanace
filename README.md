# 🚢 Maritime Loan Default Prediction System

A hybrid **Topological Data Analysis (TDA) + Machine Learning** framework designed to predict maritime loan defaults using vessel characteristics, financial indicators, and market conditions. This project combines traditional machine learning techniques with network-based topological analysis to improve risk assessment and decision-making in maritime finance.

---

## 📌 Overview

Maritime lending involves significant financial risk due to fluctuating market conditions, vessel depreciation, and operational uncertainties. This system provides an intelligent approach to assessing loan default risk by integrating:

* Machine Learning prediction models
* Topological Data Analysis (TDA)
* Financial and vessel performance indicators
* Interactive web-based dashboard

The application allows users to predict loan default probability, explore datasets, analyze network metrics, and understand the underlying prediction framework.

---

## ✨ Features

### 🔍 Loan Default Prediction

* Enter maritime company and vessel details
* Generate real-time default risk predictions
* Compare outputs across multiple ML models

### 📊 Dataset Explorer

* Browse all loan records
* Search and filter dataset entries
* View maritime financial indicators

### 🌐 TDA Metrics Dashboard

Analyze network-based relationships using:

* Degree Centrality
* Betweenness Centrality
* Clustering Coefficient
* PageRank
* Pearson Correlation Analysis

### 📖 Framework Insights

* Model architecture overview
* End-to-end prediction pipeline
* Performance comparison based on research findings

---

## 🧠 Machine Learning Models

The system implements multiple predictive models:

| Model               | Purpose                         |
| ------------------- | ------------------------------- |
| Logistic Regression | Baseline classification         |
| Decision Tree       | Rule-based prediction           |
| Random Forest       | Ensemble learning               |
| XGBoost (Simulated) | High-performance boosting model |

---

## 🌐 Topological Data Analysis (TDA)

To capture hidden relationships within maritime loan data, the framework utilizes network analysis techniques including:

* Degree Centrality
* Betweenness Centrality
* Clustering Coefficient
* PageRank
* Correlation Networks

These metrics provide additional structural insights beyond traditional machine learning features.

---

## 📂 Project Structure

```text
maritime_project/
│
├── app.py
├── maritime_loan_dataset.csv
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    │   └── style.css
    │
    └── js/
        └── main.js
```

---

## 📋 Dataset Features

### Loan Characteristics

* Loan Amount
* Loan Tenor
* Balloon Payment
* Finance Percentage
* Loan Spread

### Financial Strength Indicators

* MVC
* ACR
* Leverage Ratio

### Vessel & Operational Metrics

* Deadweight Tonnage (DWT)
* Vessel Age
* Fleet Size
* Company Experience

### Market Conditions

* Baltic Dry Index (BDI)

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/maritime-loan-default-prediction.git
cd maritime-loan-default-prediction
```

### 2️⃣ Create Virtual Environment (Optional)

```bash
python -m venv venv
```

Activate environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Run the Application

```bash
python app.py
```

### 5️⃣ Open in Browser

```text
http://127.0.0.1:5000
```

---

## 🚀 Technology Stack

### Backend

* Python
* Flask

### Data Science & Machine Learning

* Pandas
* NumPy
* Scikit-learn
* NetworkX

### Frontend

* HTML5
* CSS3
* JavaScript

---

## 📈 System Workflow

1. Load maritime loan dataset
2. Perform data preprocessing
3. Generate TDA network structure
4. Extract topological metrics
5. Train machine learning models
6. Predict loan default probability
7. Display results through interactive dashboard

---

## 🎯 Applications

* Maritime Finance Risk Assessment
* Loan Portfolio Analysis
* Credit Risk Management
* Vessel Investment Evaluation
* Banking Decision Support Systems



