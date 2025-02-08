const generateToken = require('../lib/utils')
const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const cloudinary = require('../lib/cloudinary')

const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        // check if the email are exists or not
        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: "Email already exists" })

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            // generate JWT token here
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ message: "Invalid user data" })
        }

    } catch (error) {
        console.log(`Error in signup controller ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invaild Credentials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invaild Credentials" })
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })
    }
    catch (error) {
        console.log(`Error in login controller ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" })
    }
    catch (error) {
        console.log(`Error in logout controller ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        const userId = req.user._id

        if (!profilePic) {
            res.status(400).json({ message: "profile pic is required" })
        }

        if (!profilePic.startsWith("data:image")) {
            return res.status(400).json({ message: "Invalid image format" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true } // this will give you the updated user details if you want what is it means lets hover and check it.
        )

        res.status(200).json(updatedUser)
    }
    catch (error) {
        console.log(`Error in updatedProfile ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const checkAuth = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - Not logged in" })
        }
        res.status(200).json(req.user)
    }
    catch (error) {
        console.log(`Error in checkAuth ${error.message}`)
        res.status(500).json({ message: "Internal Server Error" })
    }
} // when user refresh the page this check the user logged in or not , if user logged in then the user details will send to client

module.exports = { signup, login, logout, updateProfile, checkAuth }