const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

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

module.exports = router;