import requests
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # Set this in your environment
GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}"
}

def transcribe_with_groq_whisper(audio_file_path: str):
    """
    Transcribes audio using Groq's Whisper v3-turbo model.
    :param audio_file_path: Path to a short audio file (WAV, MP3, M4A)
    :return: Transcription response as dict
    """

    files = {
        'file': (os.path.basename(audio_file_path), open(audio_file_path, 'rb')),
    }

    data = {
        "model": "whisper-large-v3-turbo",  # Groq-specific model name
        "response_format": "json",
        "temperature": 0.0,  # For consistent output
        "timestamp_granularities": ["word", "segment"],  # Get detailed timestamps
        "language": "en",  # Optional, auto-detects if not given
    }

    response = requests.post(GROQ_API_URL, headers=HEADERS, data=data, files=files)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Whisper API error: {response.status_code} - {response.text}")


from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from groq_whisper import transcribe_with_groq_whisper
import tempfile
import shutil

app = FastAPI()

# Allow frontend access (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    result = transcribe_with_groq_whisper(tmp_path)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
