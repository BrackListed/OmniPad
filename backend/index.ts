import "dotenv/config"
import express from "express"
import cors from "cors"
import { verifyWebhook } from '@clerk/express/webhooks'
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { clerkMiddleware } from '@clerk/express'
import multer from "multer"
import path from "path"
import {Queue} from "bullmq"
import IORedis from "ioredis"
import fs from "fs"
import crypto from "crypto";
import Groq from "groq-sdk";
import { file } from "./db/schema.js"
import "./worker.js"
const app = express()
const pool = new Pool({connectionString: process.env.DATABASE_URL})
const db = drizzle(process.env.DATABASE_URL!)

// Dynamically handles your local dev or your deployed Render frontend URL
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173" 

app.use(cors({
  origin: [allowedOrigin, 'https://omni-pad-sepia.vercel.app', 'http://localhost:5173'], 
  credentials: true
}))



app.post('/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req)
    const { id, email_addresses, username, first_name  } = evt.data as {
      id: string
      email_addresses: Array<{ email_address: string }>
      username: string | null
      first_name: string | null
    }
    const eventType = evt.type
    if(eventType === "user.created"){
      await pool.query("INSERT INTO users(clerk_user_id, email, username) VALUES($1, $2, $3)", [id, email_addresses[0]?.email_address ?? "", username ?? first_name ])
    }
    return res.status(200).send('Webhook received')
  } catch (err) {
    console.error('Error verifying webhook:', err)
    res.status(400).send('Error verifying webhook')
  }
})

app.use(clerkMiddleware())
app.use(express.json())

const redisConnection = new IORedis(process.env.REDIS_URL!, {maxRetriesPerRequest: null})
redisConnection.on("error", (err) => console.error("[API] Redis connection error:", err.message))

async function waitForJob(job: Awaited<ReturnType<Queue['add']>>, timeoutMs = 120000, intervalMs = 300) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const state = await job.getState()
    if (state === 'completed') return
    if (state === 'failed') throw new Error(job.failedReason || 'Job failed')
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error('Job timed out')
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const shortName = Date.now() + path.extname(file.originalname);
    cb(null, shortName)
  }
})

const upload = multer({storage: storage})
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


app.get("/users/:userId", async(req, res) => {
  const {userId} = req.params
  const result = await pool.query("SELECT id, username, email, has_seen_tour FROM users WHERE clerk_user_id = $1", [userId])
  if(result.rows.length === 0) return res.status(404).json({message: "User not found"})
  res.json(result.rows[0])
})

app.get("/tasks/:userId", async(req, res) => {
  const {userId} = req.params
  try{
    const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
    const result = await pool.query("SELECT * FROM tasks where user_id = $1 ORDER BY due DESC", [id.rows[0].id])
    res.json({isLoading: false, tasks: result.rows})
  } catch(err){
    console.error(err)
    res.status(500).json({
      isLoading: true,
      message: "Tasks failed to load"
    })
  }
})

app.get("/file/:userId", async(req, res) => {
  const {userId} = req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  const result = await pool.query("SELECT * FROM file WHERE user_id = $1 ORDER BY upload_date DESC", [id.rows[0].id])
  res.json({files: result.rows})
})

app.get("/session/:userId/:type/:fileId", async(req, res) => {
  const {userId, type, fileId} =  req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  const result = await pool.query("SELECT * FROM study_sessions WHERE file_id = $1 AND mode = $2 AND user_id = $3", [fileId, type, id.rows[0].id])
  res.json(result.rows)
})

app.get("/global/sessions/:userId", async(req, res) => {
  const {userId} = req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  const result = await pool.query("SELECT * FROM study_sessions WHERE user_id = $1", [id.rows[0].id])
  res.json(result.rows)
})

app.post("/add/tasks/:userId", async(req, res) => {
  const {userId} = req.params
  const {title, details, due, type} = req.body
  try{
    const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
    await pool.query("INSERT INTO tasks(user_id, title, details, due, type) VALUES($1, $2, $3, $4, $5)", [id.rows[0].id, title, details, due, type])
    res.json({status: true, message: "Tasks inserted into database successfully!"})
  } catch(err){
    console.error(err)
    res.status(500).json({
      status: false,
      message: "Tasks failed to be inserted into the database"
    })
  }
})

app.post('/upload/file/:userId', upload.single('file'), async(req, res) => {
  const {userId} = req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  const file = req.file
  if(!file) return res.status(400).json({error: "No file uploaded"})
  const fileBuffer = fs.readFileSync(file!.path)
  const fileHash = crypto.createHash(`sha256`).update(fileBuffer).digest('hex')
  const existingFile = await pool.query("SELECT id, path FROM file WHERE user_id = $1 and file_hash = $2", [id.rows[0].id, fileHash])
  if(existingFile.rows.length > 0){
    if(fs.existsSync(existingFile.rows[0].path)){
      if(fs.existsSync(file!.path)){
        fs.unlinkSync(file!.path)
      }

      return res.status(200).json({
        message: "Duplicate file detected. Reusing existing file record.",
        id: existingFile.rows[0].id,
        path: existingFile.rows[0].path
      });
    }

    await pool.query("UPDATE file SET path = $1 WHERE id = $2", [file!.path, existingFile.rows[0].id])
    return res.status(200).json({
      message: "Existing file was missing on disk. Recreated from new upload.",
      id: existingFile.rows[0].id,
      path: file!.path
    });
  }
  const result = await pool.query("INSERT INTO file(filename, user_id, path, file_hash) VALUES($1, $2, $3, $4) RETURNING id, path", [file?.originalname, id.rows[0].id, file.path, fileHash])
  res.json({id: result.rows[0].id, path: result.rows[0].path})
})

app.post("/generate/session/:userId", async(req, res) => {
  const {userId} = req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  const {type, fileId, path} = req.body

  const existingSession = await pool.query("SELECT id FROM study_sessions WHERE file_id = $1 AND mode = $2 AND user_id = $3", [fileId, type, id.rows[0].id])
  if(existingSession.rows.length > 0){
    return res.status(200).json({message: "Study session already exists", fileId: fileId})
  }
  const myQueue = new Queue('pdf-processing', {connection: redisConnection});
  const job = await myQueue.add('extract-and-generate', {
    fileId: fileId,
    userId: id.rows[0].id,
    type: type,
    filePath: path
  })
  try {
    await waitForJob(job)
  } catch (err) {
    console.error('Study session generation failed:', err)
    return res.status(500).json({message: "Failed to generate study session", error: err instanceof Error ? err.message : String(err)})
  }
  return res.status(200).json({message: "Study session ready", fileId: fileId})
})

app.post("/study-session/reshuffle/:userId/:sessionId", async(req, res) => {
  const {userId, sessionId} = req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  const session = await pool.query("SELECT file_id, mode FROM study_sessions WHERE id = $1 AND user_id = $2", [sessionId, id.rows[0].id])
  if(session.rows.length === 0){
    return res.status(404).json({message: "Study session not found"})
  }
  const {file_id: fileId, mode} = session.rows[0]
  const file = await pool.query("SELECT path FROM file WHERE id = $1", [fileId])
  if(file.rows.length === 0){
    return res.status(404).json({message: "Source file not found"})
  }

  await pool.query("DELETE FROM study_sessions WHERE id = $1 AND user_id = $2", [sessionId, id.rows[0].id])

  const myQueue = new Queue('pdf-processing', {connection: redisConnection});
  const job = await myQueue.add('extract-and-generate', {
    fileId: fileId,
    userId: id.rows[0].id,
    type: mode,
    filePath: file.rows[0].path
  })
  try {
    await waitForJob(job)
  } catch (err) {
    console.error('Reshuffle failed:', err)
    return res.status(500).json({message: "Failed to reshuffle study session", error: err instanceof Error ? err.message : String(err)})
  }
  return res.status(200).json({message: "Study session reshuffled", fileId: fileId, type: mode})
})

app.post("/process-answer", async(req, res) => {
  const {answer, question, reference} = req.body
  const completions = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    response_format: {type: "json_object"},
    messages: [{
      role: "system",
      content: `You are a pragmatic, expert conceptual tutor. Evaluate the user's answer against the Reference Answer using the Feynman technique: check for genuine conceptual understanding using plain, simple language and zero jargon.
      GUIDELINE:
      1. FEYNMAN + REFERENCE CHECK: Mark 'correct' as true if the user explains the core idea of the Reference Answer simply and accurately, even if brief or using everyday analogies.
      2. NO PEDANTRY: Do not force rigid schemas, lengthy rubrics, or academic nitpicking.
      3. PRACTICAL ADDITIONS ONLY: If an explanation needs work for a specific target audience (e.g., a 10-year-old), validate what works first, then offer 1 concise, concrete example or tweak.
      4. TONE: Direct, encouraging, concise. Speak like a smart peer, not a strict grader.
      Output strictly in JSON matching this schema:
      {
        "correct": boolean,
        "explanation": "string"
      }
      Rules:
      1. Set 'correct' to true if correct, or false if flawed.
      2. If 'correct' is false, populate 'explanation'. If true, set to "".
      3. Output ONLY raw JSON.
      
      Reference Answer: ${reference}`
    },
    {
      role: 'user',
      content: `Question: ${question} \n Answer: ${answer}`
    }
    ]
  })
  const responseContent = completions.choices[0]?.message?.content ?? "{}"
  const data = JSON.parse(responseContent)
  return res.json(data)
})

app.patch("/study-session/save/:userId/:sessionId", async(req, res) => {
  try{
    const {userId, sessionId} = req.params
    const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
    const {score, wrong, passed} = req.body
    await pool.query("UPDATE study_sessions SET score = $1, wrong_index = $2, passed = $3, already_attempted = true WHERE id = $4 AND user_id = $5", [score, wrong, passed, sessionId, id.rows[0].id])
    res.json({status: true, message: "Successfully sent to database!"})
  } catch(err){
    console.error("Can't save to database", err)
    return res.status(500).json({status: false, message: "Failed to save to database"})
  }
})


app.patch("/complete/:fileId/:userId", async(req, res) => {
  const {fileId, userId} = req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  await pool.query("UPDATE file SET completed = $1 WHERE id = $2 AND user_id = $3", [true, fileId, id.rows[0].id])
  res.json({message: "Successfully marked as complete"})
})

app.patch("/users/complete-tour/:userId", async(req, res) => {
  const {userId} = req.params
  const id = await pool.query("SELECT id FROM users WHERE clerk_user_id = $1", [userId])
  await pool.query("UPDATE users SET has_seen_tour = $1 WHERE id = $2", [true, id.rows[0].id])
  res.json({message: "Tour completed"})
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
