const express = require('express')
const protectRoute = require('../middleware/auth.middleware')
const {getUsersForSidebar, getMessages, sendMessage} = require('../controllers/message.controller')

const router = express.Router()

router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessages) //get the user id and get the messages

router.post("/send/:id", protectRoute, sendMessage)

module.exports = router