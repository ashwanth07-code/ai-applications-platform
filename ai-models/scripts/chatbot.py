#!/usr/bin/env python3
"""
AI ChatBot using Google Gemini API (Working)
"""
import sys
import json
import requests

class AIAssistant:
    def __init__(self):
        # Get your API key from https://aistudio.google.com/apikey
        self.api_key = "AIzaSyD_BgvkhPky1TH68JSzbZqfqdHc5qEs-bs"  # <-- REPLACE WITH YOUR KEY
        
        # Use the correct model name with full path
        # From your list: models/gemini-1.5-flash-002
        self.model = "gemini-1.5-flash-002"
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        self.conversation_history = []
        
    def generate_response(self, message):
        try:
            # Simple payload without complex history (works reliably)
            payload = {
                "contents": [
                    {
                        "parts": [{"text": message}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 500,
                }
            }
            
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                bot_response = result['candidates'][0]['content']['parts'][0]['text']
                return bot_response
            else:
                error_msg = f"API Error: {response.status_code}"
                print(error_msg, file=sys.stderr)
                if response.text:
                    print(response.text, file=sys.stderr)
                return self.get_fallback_response(message)
                
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            return self.get_fallback_response(message)
    
    def get_fallback_response(self, message):
        """Smart fallback responses"""
        message_lower = message.lower()
        
        responses = {
            'machine learning': "Machine Learning is a subset of AI that enables systems to learn from data without being explicitly programmed. It uses algorithms to identify patterns and make predictions. Examples include recommendation systems, spam filters, and image recognition.",
            'artificial intelligence': "Artificial Intelligence (AI) is the simulation of human intelligence in machines. It includes subfields like machine learning, deep learning, natural language processing, computer vision, and robotics.",
            'what is ai': "Artificial Intelligence (AI) is the simulation of human intelligence in machines programmed to think and learn.",
            'python': "Python is a high-level programming language known for its simplicity and readability. It's widely used in web development, data science, AI/ML, automation, and more.",
            'javascript': "JavaScript is a programming language for web development. It makes web pages interactive and is used in both frontend and backend (Node.js).",
            'hello': "Hello! How can I help you today?",
            'hi': "Hi there! What would you like to know?",
            'how are you': "I'm doing great! Thanks for asking. How can I assist you?",
            'bye': "Goodbye! Have a great day!",
            'thanks': "You're welcome! Happy to help.",
        }
        
        for key, response in responses.items():
            if key in message_lower:
                return response
        
        return f"That's an interesting question about '{message[:50]}'. Could you provide more details?"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No message provided"}))
        sys.exit(1)
    
    try:
        assistant = AIAssistant()
        message = sys.argv[1]
        response = assistant.generate_response(message)
        print(response)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)