from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

MODEL_PATH = "/Users/prakethpotlapalli/UncommonApp/ml/college_models.pkl"
models = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else {}
print(f"Loaded {len(models)} school models")

class PredictRequest(BaseModel):
    school: str
    gpa: float
    sat: float
    first_gen: bool = False

@app.post("/ml-predict")
def predict(req: PredictRequest):
    key = req.school.lower().strip()

    # Fuzzy match — try partial name match if exact not found
    if key not in models:
        matches = [k for k in models if k in key or key in k]
        if matches:
            key = matches[0]
        else:
            return {"ml_available": False, "school": req.school}

    entry = models[key]
    model = entry["model"]

    X = np.array([[req.gpa, req.sat, int(req.first_gen)]])
    prob = float(model.predict_proba(X)[0][1])

    return {
        "ml_available": True,
        "ml_chance": round(prob, 3),
        "model_auc": entry["auc"],
        "n_training_samples": entry["n_samples"],
        "model_type": entry["model_type"],
        "school_matched": key,
    }

@app.get("/models")
def list_models():
    return {
        "total": len(models),
        "schools": sorted(models.keys())
    }
