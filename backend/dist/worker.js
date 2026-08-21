"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const pdf_parse_1 = require("pdf-parse");
const pg_1 = require("pg");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const fs_1 = __importDefault(require("fs"));
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
const redisConnection = new ioredis_1.default(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
redisConnection.on("connect", () => console.log("[Worker] Connected to Redis"));
redisConnection.on("error", (err) => console.error("[Worker] Redis connection error:", err.message));
function getPrompt(type) {
    const baseInstruction = "You are an AI study assistant. Extract concepts from the provided text and output ONLY valid JSON adhering strictly to the required schema. Do not include markdown code block formatting (like ```json) in your final response if JSON mode is enabled.";
    switch (type) {
        case "Feynman":
            return `${baseInstruction}
                Mode: Feynman Technique. Generate open-ended questions designed to make the user explain key concepts in simple terms.
                JSON Schema Format Required:
                {
                    "type": "Feynman",
                    "title": "Topic Title",
                    "questions": [
                        {
                            "id": 1,
                            "concept": "Concept Name",
                            "question": "Explain [concept] as if you were teaching it to a 10-year-old."
                            "referenceAnswer": "Clear, concise baseline answer based on the source text explaining the core idea."
                        }
                    ]
                }`;
        case "Socratic":
            return `${baseInstruction}
                Mode: Socratic Method. Generate guiding, probe-style questions that lead the user to discover deep insights about the material themselves.
                JSON Schema Format Required:
                {
                    "type": "Socratic",
                    "title": "Topic Title",
                    "questions": [
                        {
                            "id": 1,
                            "prompt": "Why do you think [Concept] happens under [Condition]?",
                            "guidanceHint": "Think about what happens to [Variable] when [Condition] changes."
                            "referenceAnswer": "Clear, concise baseline answer based on the source text explaining the core idea."
                        }
                    ]
                }`;
        case "Quiz":
            return `${baseInstruction}
                Mode: Multiple Choice Quiz. Generate multiple-choice questions testing comprehension, complete with 4 options and the correct answer.
                JSON Schema Format Required:
                {
                    "type": "quiz",
                    "title": "Quiz Title",
                    "questions": [
                        {
                            "id": 1,
                            "question": "Question text here?",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correctAnswer": "Option A",
                            "explanation": "Brief explanation why Option A is correct."
                        }
                    ]
                }`;
        case "Flashcards":
            return `${baseInstruction}
                Mode: Flashcards. Generate study flashcards with a front prompt/concept and a clear back answer.
                JSON Schema format required:
                {
                    "type": "flashcards",
                    "title": "Deck Title",
                    "questions": [
                        {
                            "id": 1,
                            "front": "Term or Question on the front of the card",
                            "back": "Key definition or correct answer on the back of the card"
                        }
                    ]
                }`;
        default:
            throw new Error(`Unsupported type: ${type}`);
    }
}
const pdfWorker = new bullmq_1.Worker("pdf-processing", async (job) => {
    const { fileId, userId, type, filePath } = job.data;
    console.log(`[Worker] Received job ${job.id} — fileId=${fileId}, type=${type}, filePath=${filePath}`);
    if (!fs_1.default.existsSync(filePath)) {
        throw new Error("Source file is missing on disk. Please re-upload the file.");
    }
    const buffer = fs_1.default.readFileSync(filePath);
    const parser = new pdf_parse_1.PDFParse({ data: buffer });
    const data = await parser.getText();
    await parser.destroy();
    const text = data.text;
    const CHUNK_SIZE = 12000;
    if (!text.trim()) {
        throw new Error("No text found!");
    }
    const textChunks = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
        textChunks.push(text.slice(i, i + CHUNK_SIZE));
    }
    const systemPrompt = getPrompt(type);
    const completionsList = [];
    let payload = {
        type: type,
        title: "",
        questions: [],
    };
    console.log(`[Worker] Job ${job.id}: parsed ${text.length} chars into ${textChunks.length} chunk(s), starting Groq generation`);
    for (let i = 0; i < textChunks.length; i++) {
        console.log(`[Worker] Job ${job.id}: requesting chunk ${i + 1}/${textChunks.length} from Groq`);
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            response_format: { type: "json_object" },
            messages: [{
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Document Chunk (${i + 1}/${textChunks.length}):\n${textChunks[i]}`
                }
            ]
        });
        const parsedData = JSON.parse(completion.choices[0].message.content);
        payload.title = parsedData.title || payload.title;
        const newItems = parsedData.questions || [];
        payload.questions.push(...newItems);
        completionsList.push(parsedData);
    }
    console.log(`[Worker] Job ${job.id}: Groq generation complete, saving study session`);
    payload.questions = payload.questions.map((item, index) => ({
        ...item,
        id: index + 1
    }));
    const topic = payload.title || `${type} Session`;
    const formattedMode = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    const existingSession = await pool.query("SELECT id FROM study_sessions WHERE file_id = $1 AND mode = $2", [fileId, formattedMode]);
    if (existingSession.rows.length > 0) {
        console.log(`[Worker] Study session for file ${fileId} and mode ${formattedMode} already exists. Skipping duplicate insert.`);
    }
    else {
        await pool.query("INSERT INTO study_sessions(user_id, file_id, mode, topic, score, passed, payload) VALUES($1, $2, $3, $4, $5, $6, $7)", [userId, fileId, formattedMode, topic, 0, false, JSON.stringify(payload)]);
    }
}, { connection: redisConnection });
pdfWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});
