import "dotenv/config"
import express from "express"
import cors from "cors"
import { verifyWebhook } from '@clerk/express/webhooks'
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { clerkMiddleware } from '@clerk/express'

const app = express()
const pool = new Pool({connectionString: process.env.DATABASE_URL})
const db = drizzle(process.env.DATABASE_URL!)

// Dynamically handles your local dev or your deployed Render frontend URL
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173"

app.use(cors({
  origin: [allowedOrigin], 
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

app.get("/test", (req, res) => {
  res.json({ message: "Backend is alive and connected!" })
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
