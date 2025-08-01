from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from groq_whisper import transcribe_audio
from groq_llm import translate_and_pronounce

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/audio")
async def process_audio(file: UploadFile = File(...), source_lang: str = "Chinese", target_lang: str = "Tamil"):
    with open(file.filename, "wb") as buffer:
        buffer.write(await file.read())

    transcribed_text = transcribe_audio(file)
    result = translate_and_pronounce(transcribed_text, source_lang, target_lang)
    return {
        "original_text": transcribed_text,
        "translation_result": result
    }

@app.post("/api/custom-reply")
async def custom_reply(sentence: str, source_lang: str, target_lang: str):
    result = translate_and_pronounce(sentence, source_lang, target_lang)
    return {"translation_result": result}
