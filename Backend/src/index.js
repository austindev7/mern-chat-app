const express = require('express');
const connectDB = require('./lib/db');
const authRoutes = require('./routes/auth.route'); // Import Routes
const messageRoutes = require('./routes/message.route'); // Import Routes
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')
dotenv.config()
const {app, server} = require('./lib/socket')
const path = require('path')

app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json({ limit: "10mb" }));
app.use("/api/auth", authRoutes); 
app.use("/api/messages", messageRoutes); 

const PORT = process.env.PORT
const _dirname = path.resolve()

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
      });
}

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT} `)
    connectDB()
}); // Start Server