import requests

# PASTE YOUR ACTUAL API KEY HERE
API_KEY = "AIzaSyD_BgvkhPky1TH68JSzbZqfqdHc5qEs-bs"

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

response = requests.get(url)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    models = response.json()
    print("\n✅ Available Models:\n")
    print("-" * 60)
    for model in models.get('models', []):
        name = model.get('name', 'N/A')
        display_name = model.get('displayName', 'N/A')
        supported_methods = model.get('supportedGenerationMethods', [])
        print(f"Name: {name}")
        print(f"Display: {display_name}")
        print(f"Methods: {supported_methods}")
        print("-" * 60)
else:
    print("Error:", response.text)