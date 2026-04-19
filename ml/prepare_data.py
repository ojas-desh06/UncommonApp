import pandas as pd
import json

with open("/Users/prakethpotlapalli/UncommonApp/ml/decisions.json") as f:
    data = json.load(f)

df = pd.DataFrame(data)
print(f"Raw records: {len(df)}")

df = df[df["outcome"].isin(["accepted", "rejected", "waitlisted"])]
df = df[df["school"].notna()]
df = df[df["gpa"].notna()]

ACT_TO_SAT = {
    36:1590,35:1540,34:1500,33:1460,32:1430,31:1400,30:1370,
    29:1340,28:1310,27:1280,26:1240,25:1210,24:1180,23:1140,
    22:1110,21:1080,20:1040,19:1010,18:970,17:930,16:890,15:850
}

def normalize_score(row):
    try:
        if pd.notna(row.get("sat")) and row["sat"]: return float(row["sat"])
    except: pass
    try:
        if pd.notna(row.get("act")) and row["act"]:
            return ACT_TO_SAT.get(int(float(row["act"])))
    except: pass
    return None

df["sat_normalized"] = df.apply(normalize_score, axis=1)
df["outcome_binary"] = (df["outcome"] == "accepted").astype(int)
df["gpa"] = pd.to_numeric(df["gpa"], errors="coerce")
df["first_gen"] = df.get("first_gen", False).fillna(False).astype(int)
df["school"] = df["school"].astype(str).str.lower().str.strip()

df = df.dropna(subset=["gpa", "sat_normalized"])
df = df[(df["gpa"] >= 1.0) & (df["gpa"] <= 5.0)]
df = df[(df["sat_normalized"] >= 400) & (df["sat_normalized"] <= 1600)]

df.to_csv("/Users/prakethpotlapalli/UncommonApp/ml/decisions_clean.csv", index=False)

print(f"Clean records: {len(df)}")
print(f"Unique schools: {df['school'].nunique()}")
print(f"Accept rate: {df['outcome_binary'].mean():.1%}")
print("\nTop schools by volume:")
print(df["school"].value_counts().head(20).to_string())
