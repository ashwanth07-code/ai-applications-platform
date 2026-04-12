import requests

# PASTE YOUR ACTUAL API KEY HERE (starts with AIza)
API_KEY = "AIzaSyD_BgvkhPky1TH68JSzbZqfqdHc5qEs-bs"

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key={API_KEY}"

payload = {
    "contents": [
        {
            "parts": [{"text": "What is machine learning? Answer in 2 sentences."}]
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