import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import grievanceRoutes from './routes/grievances.js'
import adminRoutes from './routes/admin.js'
import voterRoutes from './routes/voters.js'
import flowRoutes from './routes/flow.js'
import publicRoutes from './routes/public.js'
import { initDB } from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/grievances', grievanceRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/voters', voterRoutes)
app.use('/api/flow', flowRoutes)
app.use('/api/public', publicRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.USE_DEMO_MODE === 'true' ? 'demo' : 'production' })
})

// Catch-all for unknown routes (prevents 404 HTML / CSP errors)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Initialize database and start server
async function start() {
  await initDB()
  app.listen(PORT, () => {
    console.log(`🏛 TVK Grievance Portal Backend running on port ${PORT}`)
    console.log(`   Mode: ${process.env.USE_DEMO_MODE === 'true' ? '🧪 DEMO (in-memory)' : '🍃 PRODUCTION (MongoDB Atlas)'}`)
  })
}

start()
