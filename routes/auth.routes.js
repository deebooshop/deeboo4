const router = require("express").Router();
const User = require("../models/user.models");
const Address = require("../models/address.models");
const Cart = require("../models/cart.models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");

router.get("/user/:id",async(req,res)=>{

    try {
        console.log(req.params.id);
        const user= await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json("not found user");
        } else {
            return res.status(200).json(user);
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

router.get("/check", verifyToken, async (req, res) => {
    // check user token validation on request

    try {
        const user = await User.findById(req.verifiedUser._id);
        if (!user) {
            return res.status(404).json("not found user");
        } else {
            return res.status(200).json(user);
        }
    } catch (err) {
        return res.status(500).json(err);
    }
});
router.post("/register", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(422).json("Email already exist");
        }
    } catch (err) {
        return res.status(500).json(err);
    }

    try {
        const newAddress = new Address({
            street: req.body.street,
            city: req.body.city,
            country: req.body.country,
            zipCode: req.body.zipCode,
        });
        const savedAddress = await newAddress.save();
        const salt = await bcrypt.genSalt(16);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newCart = new Cart();
        const savedCart = (await newCart.save())._id;
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            address: savedAddress._id,
            cart: savedCart._id,
        });
        const savedUser = await newUser.save();
        return res.status(201).json(savedUser);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json("Wrong Email/Password");
        }
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json("Wrong Email/Password");
        }
        /* const token = jwt.sign(
            { _id: user._id, email: user.email, cart: user.cart, isAdmin: user.isAdmin },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2 days",
            },
        ); */

        return res.status(200).json(user._id);
    } catch (err) {
        return res.status(500).json(err);
    }
});
module.exports = router;