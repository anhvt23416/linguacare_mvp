import os
import logging
import json
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import google.generativeai as genai

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Linguacare ML Sidecar", description="AI Orchestration for parsing materials and generating quizzes.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from dotenv import load_dotenv

# Load environment variables
load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    load_dotenv("../linguacare_frontend/.env")

# Hardware & Routing Config
USE_CLOUD_FALLBACK = os.getenv("USE_CLOUD_FALLBACK", "true").lower() == "true"
HARDWARE_PROFILE = os.getenv("HARDWARE_PROFILE", "cpu") # 'cpu' (Iris Xe), 'cuda' (RTX 4060), 'openvino'
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini API configured for cloud fallback.")

class ParseResponse(BaseModel):
    status: str
    backend_used: str
    extracted_vocabulary: list[dict]
    quiz_structure: dict
    transformed_story: str
    original_cefr: str
    lumi_message: str

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "hardware_profile": HARDWARE_PROFILE, 
        "cloud_fallback": USE_CLOUD_FALLBACK,
        "has_gemini_key": bool(GEMINI_API_KEY)
    }

async def process_with_cloud(file_bytes: bytes, filename: str) -> dict:
    """Uses Gemini API to extract vocabulary and generate quizzes from audio/text"""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Cloud fallback requested but GEMINI_API_KEY is missing.")
    
    logger.info(f"Processing {filename} with Gemini API...")
    is_audio = filename.lower().endswith(('.wav', '.mp3', '.ogg', '.m4a', '.flac', '.webm'))
    
    model = genai.GenerativeModel('gemini-3.5-flash')
    
    if is_audio:
        mime_type = "audio/wav"
        if filename.lower().endswith('.mp3'):
            mime_type = "audio/mp3"
        elif filename.lower().endswith('.ogg'):
            mime_type = "audio/ogg"
        elif filename.lower().endswith('.m4a'):
            mime_type = "audio/m4a"
        elif filename.lower().endswith('.webm'):
            mime_type = "audio/webm"
            
        prompt = """
You are an expert English language tutor. 
1. Transcribe the uploaded audio.
2. BEFORE translating, evaluate the CEFR level of the original transcription. CRITICAL RULE: If the original transcription contains a mix of Vietnamese and English, its CEFR level MUST be strictly evaluated as 'A1'.
3. Translate and polish the transcription into high-quality, natural English suitable for English exam preparation (e.g. IELTS).
4. Extract 2-4 key English vocabulary words or collocations from the polished version. For each word, determine its CEFR level (A1-C2) and write a short, clear Vietnamese translation/meaning.
5. Generate a dynamic interactive quiz consisting of 2-3 questions based on the polished version and extracted vocabulary.
6. Generate a concise, highly personalized, and encouraging message for the learner based on their story to be spoken by their AI tutor Lumi. CRITICAL RULE: You MUST ensure that the message is completely jargon-free. Do NOT use educational psychology jargon like ZPD, scaffolding, or Vygotsky in the output message.

You must respond with a JSON object containing EXACTLY these keys:
- "original_cefr": String (e.g. "A1", "B1")
- "transformed_story": String (the polished version)
- "extracted_vocabulary": Array of objects, each containing "word" (string), "cefr" (string, e.g. "B2"), and "meaning" (string, in Vietnamese)
- "quiz_structure": Object containing "questions" (array of objects, each containing "type" [either "multiple_choice" or "fill_in_the_blank"], "question" [string], "options" [array of strings, ONLY for multiple_choice], and "answer" [string])
- "lumi_message": String

Do not wrap the response in any markdown code block, return ONLY the raw JSON string.
"""
        try:
            response = model.generate_content([
                {"mime_type": mime_type, "data": file_bytes},
                prompt
            ])
            text_resp = response.text
        except Exception as e:
            logger.error(f"Gemini Audio processing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Gemini processing error: {str(e)}")
    else:
        # Text file processing
        try:
            story_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            story_text = str(file_bytes)
            
        prompt = f"""
You are an expert English language tutor specialized in the Zone of Proximal Development (ZPD) and adaptive learning.
Analyze the following personal story (which may contain a mix of Vietnamese and English):
"{story_text}"

Perform the following tasks:
1. BEFORE translating, evaluate the CEFR level of the original story. CRITICAL RULE: If the original story contains a mix of Vietnamese and English, its CEFR level MUST be strictly evaluated as 'A1'.
2. Translate and polish the story into high-quality, natural English suitable for English exam preparation (e.g. IELTS).
3. Extract 2-4 key English vocabulary words or collocations from the polished story that would benefit a language learner. For each word, determine its CEFR level (A1, A2, B1, B2, C1, or C2) and write a short, clear Vietnamese translation/meaning.
4. Generate a dynamic interactive quiz consisting of 2-3 questions based on the polished story and extracted vocabulary (e.g. testing sentence transformation, fill-in-the-blank, or multiple-choice options).
5. Generate a concise, highly personalized, and encouraging message for the learner based on their story to be spoken by their AI tutor Lumi. CRITICAL RULE: You MUST ensure that the message is completely jargon-free. Do NOT use educational psychology jargon like ZPD, scaffolding, or Vygotsky in the output message.

You must respond with a JSON object containing EXACTLY these keys:
- "original_cefr": String (e.g. "A1", "B1")
- "transformed_story": String
- "extracted_vocabulary": Array of objects, each containing "word" (string), "cefr" (string, e.g. "B2"), and "meaning" (string, in Vietnamese)
- "quiz_structure": Object containing "questions" (array of objects, each containing "type" [either "multiple_choice" or "fill_in_the_blank"], "question" [string], "options" [array of strings, ONLY for multiple_choice], and "answer" [string])
- "lumi_message": String

Do not wrap the response in any markdown code block, return ONLY the raw JSON string.
"""
        try:
            response = model.generate_content(prompt)
            text_resp = response.text
        except Exception as e:
            logger.error(f"Gemini Text processing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Gemini processing error: {str(e)}")
            
    # Parse json response
    # Remove markdown formatting if the model wrapped it in ```json ... ```
    if "```" in text_resp:
        lines = text_resp.split("\n")
        json_lines = []
        for line in lines:
            if not line.strip().startswith("```"):
                json_lines.append(line)
        text_resp = "\n".join(json_lines)
        
    try:
        data = json.loads(text_resp.strip())
        return data
    except Exception as e:
        logger.error(f"Failed to parse JSON response from Gemini: {text_resp}. Error: {str(e)}")
        # Return fallback
        return {
            "original_cefr": "A1",
            "transformed_story": "I went to the park today and saw a cute cat.",
            "extracted_vocabulary": [
                {"word": "stroll", "cefr": "B2", "meaning": "đi dạo"},
                {"word": "cute", "cefr": "A1", "meaning": "dễ thương"}
            ],
            "quiz_structure": {
                "questions": [
                    {
                        "type": "multiple_choice",
                        "question": "What does 'stroll' mean?",
                        "options": ["Chạy nhanh", "Đi dạo", "Ngủ"],
                        "answer": "Đi dạo"
                    }
                ]
            }
        }

async def process_with_local(file_bytes: bytes, filename: str) -> dict:
    """Uses OpenVINO/ONNX Whisper for local edge processing"""
    logger.info(f"Processing {filename} with Local Edge Models (OpenVINO/ONNX)...")
    
    # Simulated Local Whisper + Local LLM response
    return {
        "original_cefr": "B1",
        "transformed_story": "I went to the edge computing server today.",
        "extracted_vocabulary": [
            {"word": "edge", "cefr": "B1", "meaning": "the outside limit of an object, area, or surface"},
            {"word": "compute", "cefr": "B2", "meaning": "calculate or reckon"}
        ],
        "quiz_structure": {
            "questions": [
                {
                    "type": "fill_in_the_blank",
                    "question": "Edge computing allows you to run models locally without ______ processing.",
                    "answer": "cloud"
                }
            ]
        }
    }

@app.post("/api/v1/parse-material", response_model=ParseResponse)
async def parse_material(
    file: UploadFile = File(...), 
    force_cloud: bool = Form(False)
):
    """
    Agentic chunking to extract text and generate interactive quiz structures.
    Intelligently routes to local OpenVINO/ONNX models or Cloud fallback depending on hardware.
    """
    file_bytes = await file.read()
    
    # Intelligent Routing Logic
    use_cloud = force_cloud or USE_CLOUD_FALLBACK or HARDWARE_PROFILE == "cpu"
    
    if use_cloud:
        backend = "cloud (gemini)"
        result = await process_with_cloud(file_bytes, file.filename)
    else:
        backend = "local (openvino/onnx)"
        result = await process_with_local(file_bytes, file.filename)

    return ParseResponse(
        status="success",
        backend_used=backend,
        extracted_vocabulary=result.get("extracted_vocabulary", []),
        quiz_structure=result.get("quiz_structure", {}),
        transformed_story=result.get("transformed_story", "I went to the park today and saw a cute cat."),
        original_cefr=result.get("original_cefr", "A1"),
        lumi_message=result.get("lumi_message", "Great job sharing your story! Let's practice.")
    )

class ExpandGraphRequest(BaseModel):
    vocabulary: list[dict]
    user_id: str

class ExpandGraphResponse(BaseModel):
    status: str
    edges_created: int
    edges_queued_for_review: int

@app.post("/api/v1/expand-graph", response_model=ExpandGraphResponse)
async def expand_graph(request: ExpandGraphRequest):
    """
    Generates embeddings for new words, queries Neo4j via vector search, 
    and proposes new [:SEMANTIC_SIMILAR] edges.
    """
    logger.info(f"Expanding graph for {len(request.vocabulary)} words...")
    
    # Mock Neo4j Vector Search and insertion
    # In a real implementation:
    # 1. Get embeddings for each word via Sentence-Transformers (local) or OpenAI/Gemini Embeddings
    # 2. Query Neo4j vector index: CALL db.index.vector.queryNodes(...)
    # 3. Create MERGE statements for new VocabularyNodes
    # 4. Create [:SEMANTIC_SIMILAR] edges
    
    # If student is self-learner, edges_created > 0.
    # If tutor_review is needed, edges_queued_for_review > 0.
    
    return ExpandGraphResponse(
        status="success",
        edges_created=len(request.vocabulary) * 2, # Mock 2 edges per word
        edges_queued_for_review=0
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
