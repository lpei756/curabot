const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkToken = require('./checkToken');
const { validationResult } = require('express-validator');

router.post('/register', async (req, res) => {
  const { email, password, firstName, middleName, lastName, dateOfBirth, gender, bloodGroup, ethnicity, address, phone, emergencyContact, medicalHistory, insurance } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email is already registered' });
    }

    const newUser = new User({
      email,
      password,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      ethnicity,
      address,
      phone,
      emergencyContact,
      medicalHistory,
      insurance,
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    console.log('Hashed password during registration:', newUser.password);  // 打印加密后的密码
    await newUser.save();

    res.status(201).json({
      patientID: newUser.patientID,
      nhi: newUser.nhi,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ error: "Email is required" });
  }
  if (!password) {
    return res.status(422).json({ error: "Password is required" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ error: "No user was found with this email." });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    console.log('User input password:', password); // 打印用户输入的明文密码
    console.log('Stored hashed password:', user.password); // 打印存储在数据库中的哈希密码
    if (!checkPassword) {
      return res.status(422).json({ error: "Wrong password, try again." });
    }

    user.loginTime = (user.loginTime || 0) + 1;
    await user.save();

    const secret = process.env.JWT_SECRET;
    console.log('JWT Secret:', secret);
    const token = jwt.sign(
        {
          id: user._id,
        },
        secret,
        { expiresIn: "1h" }
    );

    const userWithoutPassword = {
      _id: user._id,
      name: user.firstName + " " + user.lastName,
      email: user.email,
      avatar: user.avatar,
      loginTime: user.loginTime,
    };

    res.status(200).json({
      message: "User logged in successfully!",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Error during user login:", error.message);
    res.status(500).json({ error: "Something went wrong, try again later" });
  }
});

router.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, "-password");
    if (!user) {
      return res.status(404).json({ error: "User is not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error fetching user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/user/:id", checkToken, async (req, res) => {
  const { name, email, avatar, password } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt); // 进行密码加密
    }

    user.firstName = name ?? user.firstName;
    user.email = email ?? user.email;
    user.avatar = avatar ?? user.avatar;
    await user.save();

    const userWithoutPassword = {
      _id: user._id,
      firstName: user.firstName,
      email: user.email,
      avatar: user.avatar,
    };

    res.json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Error updating user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user/:id/logout", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.loginTime = (user.loginTime || 0) + 1;
    await user.save();
    res.json({ message: "Logout successful, login count updated." });
  } catch (error) {
    console.log("Error logging out user:", error.message);
    res.status(500).json({ error: "Logout failed, please try again later." });
  }
});

module.exports = router;
