import pandas as pd
import numpy as np
import joblib
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("/Users/prakethpotlapalli/UncommonApp/ml/decisions_clean.csv")

FEATURES = ["gpa", "sat_normalized", "first_gen"]
MIN_SAMPLES = 5

models = {}
skipped = []

for school, group in df.groupby("school"):
    if len(group) < MIN_SAMPLES:
        skipped.append(school)
        continue

    X = group[FEATURES].fillna(group[FEATURES].median())
    y = group["outcome_binary"]

    if y.nunique() < 2:
        skipped.append(school)
        continue

    # Try XGBoost, fall back to logistic regression for small samples
    if len(group) >= 50:
        model = XGBClassifier(n_estimators=100, max_depth=3,
                              eval_metric="logloss", random_state=42, verbosity=0)
    else:
        scaler = StandardScaler()
        X = pd.DataFrame(scaler.fit_transform(X), columns=FEATURES)
        model = LogisticRegression(random_state=42, max_iter=500)

    try:
        cv = min(3, y.value_counts().min())
        if cv < 2:
            model.fit(X, y)
            auc = 0.0
        else:
            scores = cross_val_score(model, X, y, cv=cv, scoring="roc_auc")
            auc = scores.mean()
            model.fit(X, y)

        models[school] = {
            "model": model,
            "auc": round(float(auc), 3),
            "n_samples": len(group),
            "accept_rate": round(float(y.mean()), 3),
            "model_type": type(model).__name__,
        }
        print(f"✓ {school:<50} n={len(group):>4}  AUC={auc:.2f}  accept={y.mean():.0%}")
    except Exception as e:
        print(f"✗ {school}: {e}")

joblib.dump(models, "/Users/prakethpotlapalli/UncommonApp/ml/college_models.pkl")

print(f"\n{'='*60}")
print(f"Trained: {len(models)} school models")
print(f"Skipped (too few data): {len(skipped)}")
