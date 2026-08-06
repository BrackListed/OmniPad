import "dotenv/config"
import express from "express"
import cors from "cors"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

const app = express()
const pool = new Pool({connectionString: process.env.DATABASE_URL})
const db = drizzle(process.env.DATABASE_URL!)

// Dynamically handles your local dev or your deployed Render frontend URL
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173"

app.use(cors({
  origin: [allowedOrigin], 
  credentials: true
}))

app.use(express.json())


app.get("/test", (req, res) => {
  res.json({ message: "Backend is alive and connected!" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
