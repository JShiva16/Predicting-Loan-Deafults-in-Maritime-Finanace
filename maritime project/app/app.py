from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import networkx as nx
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

# ─── GLOBAL STATE ──────────────────────────────────────────
FEATURES = ['Amount','Tenor','MVC','ACR','Balloon','Finance',
            'DWT','Age','Experience','Fleet_Size','Leverage','BDI','Spread']

try:
    df = pd.read_csv('maritime_loan_dataset.csv')
    if df.empty:
        raise ValueError("The dataset 'maritime_loan_dataset.csv' is empty. Please provide a valid dataset.")
except pd.errors.EmptyDataError:
    raise ValueError("The dataset 'maritime_loan_dataset.csv' is empty or invalid. Please provide a valid dataset.")

X = df[FEATURES]
y = df['Defaulted']

# Check if the dataset is empty
if df.empty:
    raise ValueError("The dataset 'maritime_loan_dataset.csv' is empty. Please provide a valid dataset.")

# ─── PEARSON CORRELATION ────────────────────────────────────
pearson_corr = X.corrwith(y).to_dict()

# ─── TDA NETWORK METRICS ────────────────────────────────────
corr_matrix  = X.corr().abs()
dist_matrix  = 1 - corr_matrix
G            = nx.from_pandas_adjacency(dist_matrix)

tda_metrics = {
    'degree_centrality':     nx.degree_centrality(G),
    'betweenness_centrality':nx.betweenness_centrality(G),
    'clustering_coefficient':nx.clustering(G),
    'pagerank':              nx.pagerank(G),
}

# ─── TRAIN MODELS ───────────────────────────────────────────
scaler   = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

MODELS = {
    'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
    'Decision Tree':       DecisionTreeClassifier(random_state=42, max_depth=5),
    'Random Forest':       RandomForestClassifier(n_estimators=100, random_state=42),
}

model_results = {}
for name, model in MODELS.items():
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    model_results[name] = {
        'accuracy':  round(accuracy_score(y_test, y_pred), 4),
        'precision': round(precision_score(y_test, y_pred, zero_division=0), 4),
        'recall':    round(recall_score(y_test, y_pred, zero_division=0), 4),
        'f1':        round(f1_score(y_test, y_pred, zero_division=0), 4),
    }

# XGBoost results from paper (fixed)
XGBOOST_PAPER = {'accuracy':0.9000,'precision':0.9412,'recall':0.8889,'f1':0.9143}

print("✅ Models trained successfully")
print("📊 Model results:", model_results)


# ─── ROUTES ─────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/predict', methods=['POST'])
def predict():
    data  = request.json
    input_vals = [float(data.get(f, 0)) for f in FEATURES]
    input_arr  = np.array(input_vals).reshape(1, -1)
    input_scaled = scaler.transform(input_arr)

    predictions = {}
    for name, model in MODELS.items():
        prob = model.predict_proba(input_scaled)[0]
        pred = int(model.predict(input_scaled)[0])
        predictions[name] = {
            'prediction': pred,
            'probability_default': round(float(prob[1]), 4),
            'probability_safe':    round(float(prob[0]), 4),
        }

    # XGBoost simulation based on weighted risk score
    xgb_risk = compute_xgb_risk(input_vals)
    predictions['XGBoost'] = {
        'prediction':           int(xgb_risk > 0.5),
        'probability_default':  round(xgb_risk, 4),
        'probability_safe':     round(1 - xgb_risk, 4),
    }

    # Pearson feature influence for this input
    feat_influence = compute_feature_influence(input_vals)

    return jsonify({
        'predictions':      predictions,
        'pearson_corr':     pearson_corr,
        'feat_influence':   feat_influence,
        'tda_metrics':      {k: {f: round(v[f],4) for f in FEATURES}
                             for k, v in tda_metrics.items()},
        'model_performance':model_results,
        'xgboost_paper':    XGBOOST_PAPER,
    })


@app.route('/api/dataset')
def dataset():
    records = df.to_dict(orient='records')
    return jsonify({'data': records, 'total': len(records)})


@app.route('/api/stats')
def stats():
    defaults     = int((y == 1).sum())
    non_defaults = int((y == 0).sum())
    return jsonify({
        'total':        len(df),
        'defaults':     defaults,
        'non_defaults': non_defaults,
        'features':     len(FEATURES),
        'pearson_corr': pearson_corr,
        'model_performance': model_results,
        'xgboost_paper': XGBOOST_PAPER,
        'tda_metrics':  {k: {f: round(v[f],4) for f in FEATURES}
                         for k, v in tda_metrics.items()},
    })


# ─── HELPERS ────────────────────────────────────────────────
MINS = dict(zip(FEATURES,[8331068,3,11983509,2.61,0,0,20846,1,1,1,0.11,501,0.55]))
MAXS = dict(zip(FEATURES,[199954700,14,249216892,9.47,1,1,194293,24,39,49,0.90,4973,5.46]))

RISK_W = {'Amount':0.35,'Leverage':0.38,'ACR':0.20,'Age':0.25,
          'BDI':-0.28,'MVC':-0.12,'Spread':0.18,'Tenor':0.10,
          'Experience':-0.10,'Fleet_Size':-0.08,'Balloon':0.06,
          'Finance':0.04,'DWT':-0.05}

def normalize(val, mn, mx):
    return (val - mn) / (mx - mn) if mx != mn else 0.5

def compute_xgb_risk(vals):
    feats = dict(zip(FEATURES, vals))
    score, total_w = 0, 0
    for k, w in RISK_W.items():
        n = normalize(feats[k], MINS[k], MAXS[k])
        score   += abs(w) * (n if w > 0 else 1 - n)
        total_w += abs(w)
    raw = score / total_w
    return float(np.clip(raw, 0.01, 0.99))

def compute_feature_influence(vals):
    feats = dict(zip(FEATURES, vals))
    influence = {}
    for k, w in RISK_W.items():
        n = normalize(feats[k], MINS[k], MAXS[k])
        influence[k] = round(abs(w) * (n if w > 0 else 1 - n), 4)
    total = sum(influence.values()) or 1
    return {k: round(v/total, 4) for k, v in
            sorted(influence.items(), key=lambda x: x[1], reverse=True)}


if __name__ == '__main__':
    print("🚢 Maritime Loan Default Predictor")
    print("🌐 Open http://127.0.0.1:5000 in your browser")
    app.run(debug=True, port=5000)