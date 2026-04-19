import requests
import json
import time

HEADERS = {"User-Agent": "college-admissions-research/1.0"}
BASE = "https://www.reddit.com/r/ApplyingToCollege"
QUERIES = [
    "decision results stats GPA SAT",
    "accepted rejected results thread",
    "college decisions stats accepted",
    "results my stats accepted rejected",
    "decisions ivy results",
]

posts = []
seen = set()

for query in QUERIES:
    after = None
    for page in range(5):
        params = {
            "q": query,
            "sort": "relevance",
            "t": "year",
            "limit": 100,
            "type": "link",
        }
        if after:
            params["after"] = after

        url = f"{BASE}/search.json"
        r = requests.get(url, headers=HEADERS, params=params, timeout=15)
        if r.status_code != 200:
            break

        data = r.json()
        children = data.get("data", {}).get("children", [])
        if not children:
            break

        for child in children:
            p = child["data"]
            pid = p.get("id")
            if pid in seen:
                continue
            seen.add(pid)
            body = p.get("selftext", "")
            title = p.get("title", "")
            if len(body) < 50 and len(title) < 30:
                continue
            posts.append({"title": title, "body": body[:3000]})

        after = data.get("data", {}).get("after")
        if not after:
            break
        time.sleep(1.2)

    print(f"Query '{query[:30]}': {len(posts)} total so far")
    time.sleep(2)

with open("/Users/prakethpotlapalli/UncommonApp/ml/raw_posts.json", "w") as f:
    json.dump(posts, f)

print(f"\nDone. Scraped {len(posts)} unique posts.")
