import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import {Pool} from "pg"
import { Worker } from "bullmq";
import fs from "fs"
import 'dotenv/config'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const redisOptions = {host: "localhost", port: 6379, maxRetriesPerRequest: null}
const pool = new Pool({connectionString: process.env.DATABASE_URL})

function getPrompt(type){
    const baseInstruction = "You are an AI study assistant. Extract concepts from the provided text and output ONLY valid JSON adhering strictly to the required schema. Do not include markdown code block formatting (like ```json) in your final response if JSON mode is enabled.";
    switch(type){
        case "Feynman" :
            return`${baseInstruction} 
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
                }`
        case "Socratic" :
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
                }`
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
                }`
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
                }`
        default:
            throw new Error(`Unsupported type: ${type}`)
    }
}
const pdfWorker = new Worker(
    "pdf-processing",
    async(job) => {
        const {fileId, userId, type, filePath} = job.data
        const buffer = fs.readFileSync(filePath)
        const parser = new PDFParse({data: buffer})
        const data = await parser.getText()
        await parser.destroy()
        const text = data.text
        const CHUNK_SIZE = 12000
        if(!text.trim()) { throw new Error("No text found!")}
        const textChunks = []
        for(let i = 0; i < text.length; i+= CHUNK_SIZE){
            textChunks.push(text.slice(i, i + CHUNK_SIZE))
        }
        const systemPrompt = getPrompt(type)
        const completionsList = []
        let payload = {
            type: type,
            title: "",
            questions: [],
        };
        for(let i = 0; i < textChunks.length; i++){
            const completion = await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                response_format: {type: "json_object"},
                messages: [{
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Document Chunk (${i + 1}/${textChunks.length}):\n${textChunks[i]}`
                }
                ]
            })
            const parsedData = JSON.parse(completion.choices[0].message.content);
            payload.title = parsedData.title || payload.title
            const newItems = parsedData.questions || []
            payload.questions.push(...newItems)
            completionsList.push(parsedData)
        }
        payload.questions = payload.questions.map((item, index) => ({
            ...item,
            id: index + 1
        }))
        const topic = payload.title || `${type} Session`
        const formattedMode = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
        const existingSession = await pool.query("SELECT id FROM study_sessions WHERE file_id = $1 AND mode = $2", [fileId, formattedMode]);
        if(existingSession.rows.length > 0){
            console.log(`[Worker] Study session for file ${fileId} and mode ${formattedMode} already exists. Skipping duplicate insert.`);
        } else{
            await pool.query("INSERT INTO study_sessions(user_id, file_id, mode, topic, score, passed, payload) VALUES($1, $2, $3, $4, $5, $6, $7)", [userId, fileId, formattedMode, topic, 0, false, JSON.stringify(payload)])
        }
    },
    {connection: redisOptions}
)

pdfWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err)
})
