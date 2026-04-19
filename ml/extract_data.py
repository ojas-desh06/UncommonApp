import anthropic
import json
import time
import os

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

with open("/Users/prakethpotlapalli/UncommonApp/ml/raw_posts.json") as f:
    posts = json.load(f)

print(f"Processing {len(posts)} posts...")

results = []
failed = 0

for i, post in enumerate(posts):
    text = (post["title"] + "\n\n" + post["body"])[:2500]

    try:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1024,
            system=[{
                "type": "text",
                "text": "You extract structured college admissions data from Reddit posts. Return ONLY a valid JSON array, no other text. Each element: {school, gpa, sat, act, outcome, first_gen, state}. Use null for unknown fields. outcome must be 'accepted', 'rejected', or 'waitlisted'. Only include entries where school AND outcome are clear.",
                "cache_control": {"type": "ephemeral"}
            }],
            messages=[{"role": "user", "content": f"Extract admissions data:\n\n{text}"}]
        )

        raw = response.content[0].text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        extracted = json.loads(raw)
        if isinstance(extracted, list):
            results.extend(extracted)

    except Exception as e:
        failed += 1

    if (i + 1) % 50 == 0:
        print(f"  {i+1}/{len(posts)} processed, {len(results)} records so far, {failed} failed")
        time.sleep(1)

with open("/Users/prakethpotlapalli/UncommonApp/ml/decisions.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"\nDone. Extracted {len(results)} decision records ({failed} posts failed).")
