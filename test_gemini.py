import requests

API_KEY = "AIzaSyD_BgvkhPky1TH68JSzbZqfqdHc5qEs-bs"

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"

payload = {
    "contents": [
        {
            "parts": [{"text": "What is machine learning? Answer in one sentence."}]
        }
    ]
}

response = requests.post(url, json=payload)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print("Response:", result['candidates'][0]['content']['parts'][0]['text'])
else:
    print("Error:", response.text)
