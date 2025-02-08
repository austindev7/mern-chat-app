const User = require('../models/user.model')
const Message = require('../models/message.model')
const cloudinary = require('../lib/cloudinary')
const { getReceiverSocketId, io } = require('../lib/socket')

const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json(filteredUser)
    } catch (error) {
        console.log(`Error in getUsersForSidebar ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params // destructure the user id in the route object and rename it 
        const myId = req.user._id

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log(`Error in getMessages ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params
        const senderId = req.user._id

        let imageUrl;
        if (image) {
            // upload the image in cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })
        await newMessage.save()

        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage)
    }
    catch (error) {
        console.log(`Error in sendMessage ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = { getUsersForSidebar, getMessages, sendMessage }