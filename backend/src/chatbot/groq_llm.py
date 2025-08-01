import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}

def translate_and_pronounce(sentence, source_lang, target_lang):
    prompt = f"""
You are a multilingual assistant.

Sentence: {sentence}
Source Language: {source_lang}
Target Language: {target_lang}

Tasks:
1. Translate the sentence into {target_lang}.
2. Write a pronunciation guide for the {source_lang} sentence using {target_lang} script.

Output format:
- Original: ...
- Meaning in {target_lang}: ...
- Pronunciation in {target_lang} script: ...
"""

    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
    return response.json()["choices"][0]["message"]["content"]
