// import express from 'express'
// import cors from 'cors'
// import 'dotenv/config'
// import { clerkMiddleware, requireAuth } from '@clerk/express'
// import aiRouter from './routes/aiRoutes.js'
// import connectCloudinary from './configs/cloudinary.js'
// import userRouter from './routes/userRoutes.js'

// const app = express()

// await connectCloudinary()

// app.use(cors())
// app.use(express.json())
// app.use(clerkMiddleware())

// app.get('/' , (req,res) => res.send('server is Live!'))

// app.use(requireAuth())

// app.use('/api/ai', aiRouter)
// app.use('/api/user', userRouter)

// const PORT = process.env.PORT || 3000

// app.listen(PORT, ()=>{
//     console.log('server is running on port', PORT)
// })



import express from "express"
import cors from "cors"
import "dotenv/config"
import { clerkMiddleware, requireAuth } from "@clerk/express"
import aiRouter from "./routes/aiRoutes.js"
import connectCloudinary from "./configs/cloudinary.js"
import userRouter from "./routes/userRoutes.js"

const app = express()

await connectCloudinary()

// ✅ Correct CORS fix (preflight working)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(express.json())

// Clerk middleware
app.use(clerkMiddleware())

app.get("/", (req, res) => res.send("server is Live!"))

// ❌ Remove global requireAuth()
// app.use(requireAuth())

// ✅ Only protect API routes
app.use("/api/ai", requireAuth(), aiRouter)
app.use("/api/user", requireAuth(), userRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("server is running on port", PORT)
})
