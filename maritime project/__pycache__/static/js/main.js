// ─── PAGE NAV ────────────────────────────────────────────
function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'dataset') loadDataset();
  if (name === 'tda') loadTDA();
}

// ─── TOGGLE BUTTONS ──────────────────────────────────────
const toggleVals = { Balloon: 0, Finance: 0 };

function setTog(field, val) {
  toggleVals[field] = val;
  document.getElementById(field + '-0').classList.toggle('active', val === 0);
  document.getElementById(field + '-1').classList.toggle('active', val === 1);
}

// ─── SLIDER DISPLAY ──────────────────────────────────────
function fmtM(id, label) {
  const v = parseFloat(document.getElementById(id).value);
  document.getElementById(label).textContent = (v / 1e6).toFixed(0) + 'M';
}
function fmtK(id, label) {
  const v = parseFloat(document.getElementById(id).value);
  document.getElementById(label).textContent = (v / 1000).toFixed(0) + 'K';
}
function fmtN(id, label) {
  document.getElementById(label).textContent = document.getElementById(id).value;
}
function fmtF(id, label) {
  document.getElementById(label).textContent = parseFloat(document.getElementById(id).value).toFixed(2);
}

// ─── COLLECT FORM VALUES ─────────────────────────────────
const FIELDS = ['Amount','Tenor','MVC','ACR','DWT','Age','Experience',
                'Fleet_Size','Leverage','BDI','Spread'];

function getFormData() {
  const data = {};
  FIELDS.forEach(f => data[f] = parseFloat(document.getElementById(f).value));
  data['Balloon'] = toggleVals.Balloon;
  data['Finance'] = toggleVals.Finance;
  return data;
}

// ─── RUN PREDICTION ──────────────────────────────────────
async function runPrediction() {
  const btn = document.querySelector('.predict-btn');
  btn.textContent = '⏳ Predicting...';
  btn.disabled = true;

  try {
    const resp = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getFormData())
    });
    const data = await resp.json();
    renderResults(data);
  } catch (e) {
    console.error(e);
    alert('Prediction failed. Make sure Flask server is running.');
  }

  btn.textContent = '⚡ Run Prediction';
  btn.disabled = false;
}

function renderResults(data) {
  const xgb = data.predictions['XGBoost'];
  const isDefault = xgb.prediction === 1;
  const riskPct = Math.round(xgb.probability_default * 100);
  const safePct = 100 - riskPct;

  // ── Prediction display ──
  document.getElementById('pred-display').innerHTML = `
    <div class="pred-icon ${isDefault ? 'default' : 'safe'}">${isDefault ? '⚠' : '✓'}</div>
    <div class="pred-label ${isDefault ? 'default' : 'safe'}">${isDefault ? 'DEFAULT RISK' : 'NON-DEFAULT'}</div>
    <div class="pred-sub">${isDefault
      ? 'High probability of loan default detected'
      : 'Company shows healthy repayment capability'}</div>
  `;

  document.getElementById('prob-pct').textContent = riskPct + '%';
  document.getElementById('safe-pct').textContent = safePct + '%';
  setTimeout(() => {
    document.getElementById('bar-d').style.width = riskPct + '%';
    document.getElementById('bar-s').style.width = safePct + '%';
  }, 100);

  // ── Model comparison ──
  const ORDER = ['XGBoost', 'Random Forest', 'Logistic Regression', 'Decision Tree'];
  const scoresEl = document.getElementById('model-scores');
  scoresEl.innerHTML = ORDER.map(name => {
    const m = data.predictions[name];
    const pct = Math.round(m.probability_default * 100);
    const cls = m.prediction === 1 ? 'd' : 's';
    const verdict = m.prediction === 1 ? 'DEFAULT' : 'SAFE';
    const barStyle = m.prediction === 1
      ? 'background:linear-gradient(90deg,#f59e0b,#ef4444)'
      : 'background:linear-gradient(90deg,#3b82f6,#10b981)';
    return `
      <div class="model-row">
        <div class="model-name">${name}</div>
        <div class="model-bar-wrap">
          <div class="model-bar-fill" style="${barStyle}" data-w="${pct}"></div>
        </div>
        <div class="model-score-val">${pct}%</div>
        <div class="model-verdict ${cls}">${verdict}</div>
      </div>`;
  }).join('');
  setTimeout(() => {
    document.querySelectorAll('.model-bar-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 150);

  // ── Feature influence ──
  const fi = data.feat_influence;
  const featEl = document.getElementById('feat-bars');
  const maxVal = Math.max(...Object.values(fi));
  featEl.innerHTML = Object.entries(fi).slice(0, 9).map(([name, val]) => {
    const pct = Math.round((val / maxVal) * 100);
    return `
      <div class="feat-row">
        <div class="feat-name">${name}</div>
        <div class="feat-bar-wrap">
          <div class="feat-bar-fill" data-w="${pct}"></div>
        </div>
        <div class="feat-val">${(val * 100).toFixed(1)}%</div>
      </div>`;
  }).join('');
  setTimeout(() => {
    document.querySelectorAll('.feat-bar-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 200);
}

// ─── DATASET PAGE ────────────────────────────────────────
let allRows = [];
let currentFilter = 'all';

async function loadDataset() {
  if (allRows.length > 0) { renderTable(); return; }
  try {
    const resp = await fetch('/api/dataset');
    const data = await resp.json();
    allRows = data.data;
    renderTable();
  } catch (e) {
    document.getElementById('dataset-body').innerHTML =
      '<tr><td colspan="15" style="text-align:center;padding:20px;color:#ef4444">Failed to load dataset.</td></tr>';
  }
}

function filterData(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

function renderTable() {
  const filtered = currentFilter === 'all'
    ? allRows
    : allRows.filter(r => r.Defaulted === currentFilter);

  document.getElementById('dataset-body').innerHTML = filtered.map((r, i) => `
    <tr>
      <td style="color:var(--muted)">${i + 1}</td>
      <td>${(r.Amount / 1e6).toFixed(1)}M</td>
      <td>${r.Tenor}y</td>
      <td>${(r.MVC / 1e6).toFixed(1)}M</td>
      <td>${r.ACR}</td>
      <td>${r.Balloon}</td>
      <td>${r.Finance}</td>
      <td>${(r.DWT / 1000).toFixed(0)}K</td>
      <td>${r.Age}</td>
      <td>${r.Experience}</td>
      <td>${r.Fleet_Size}</td>
      <td>${r.Leverage}</td>
      <td>${r.BDI}</td>
      <td>${r.Spread}</td>
      <td><span class="badge ${r.Defaulted === 1 ? 'default' : 'safe'}">${r.Defaulted === 1 ? 'Default' : 'Safe'}</span></td>
    </tr>
  `).join('');
}

// ─── TDA PAGE ────────────────────────────────────────────
async function loadTDA() {
  try {
    const resp = await fetch('/api/stats');
    const data = await resp.json();
    renderTDA(data);
  } catch (e) {
    document.getElementById('tda-grid').innerHTML = '<p style="color:var(--red)">Failed to load TDA metrics.</p>';
  }
}

const TDA_LABELS = {
  degree_centrality:      'Degree Centrality',
  betweenness_centrality: 'Betweenness Centrality',
  clustering_coefficient: 'Clustering Coefficient',
  pagerank:               'PageRank'
};

const FEATURES = ['Amount','Tenor','MVC','ACR','Balloon','Finance',
                  'DWT','Age','Experience','Fleet_Size','Leverage','BDI','Spread'];

function renderTDA(data) {
  const tda = data.tda_metrics;

  // 4 metric cards
  document.getElementById('tda-grid').innerHTML = Object.entries(TDA_LABELS).map(([key, label]) => `
    <div class="tda-card">
      <h3>${label}</h3>
      ${FEATURES.map(f => `
        <div class="tda-row">
          <span class="tda-feat">${f}</span>
          <span class="tda-val">${(tda[key][f] || 0).toFixed(4)}</span>
        </div>
      `).join('')}
    </div>
  `).join('');

  // Pearson correlation bars
  const pc = data.pearson_corr;
  const maxAbs = Math.max(...Object.values(pc).map(Math.abs));
  document.getElementById('pearson-bars').innerHTML = Object.entries(pc)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([name, val]) => {
      const pct = Math.round((Math.abs(val) / maxAbs) * 100);
      const isPos = val >= 0;
      const color = isPos
        ? 'background:linear-gradient(90deg,#f59e0b,#ef4444)'
        : 'background:linear-gradient(90deg,#3b82f6,#10b981)';
      const sign = isPos ? '+' : '';
      return `
        <div class="pearson-bar-row">
          <div class="pearson-name">${name}</div>
          <div class="pearson-bar-wrap">
            <div class="pearson-fill-pos" style="${color}" data-w="${pct}"></div>
          </div>
          <div class="pearson-val" style="color:${isPos ? 'var(--red)' : 'var(--green)'}">${sign}${val.toFixed(3)}</div>
        </div>`;
    }).join('');

  setTimeout(() => {
    document.querySelectorAll('.pearson-fill-pos').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 200);
}

// ─── LOAD STATS ON START ─────────────────────────────────
window.addEventListener('load', async () => {
  try {
    const resp = await fetch('/api/stats');
    const data = await resp.json();
    document.getElementById('s-total').textContent = data.total;
  } catch (e) {}
});
