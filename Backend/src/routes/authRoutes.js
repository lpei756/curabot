const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmedPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    body('firstName').notEmpty().withMessage('First Name is required'),
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('dateOfBirth').isDate().withMessage('Date of Birth is required and must be a valid date'),
    body('gender').isIn(['male', 'female', 'non-binary', 'FTM', 'MTF', 'Genderqueer', 'Other', 'Prefer not to say']).withMessage('Gender is required'),
    body('contactAddress').notEmpty().withMessage('Contact Address is required'),
    body('contactPhone').notEmpty().withMessage('Contact Phone is required'),
    body('contactEmail').isEmail().withMessage('Contact Email is required and must be a valid email'),
    body('emergencyContact.name').notEmpty().withMessage('Emergency Contact Name is required'),
    body('emergencyContact.phone').notEmpty().withMessage('Emergency Contact Phone is required'),
    body('emergencyContact.relationship').notEmpty().withMessage('Emergency Contact Relationship is required'),
    body('medicalHistory.chronicDiseases').isIn(['No', 'Other']).withMessage('Medical History Chronic Diseases is required'),
    body('medicalHistory.pastSurgeries').isIn(['No', 'Other']).withMessage('Medical History Past Surgeries is required'),
    body('medicalHistory.familyMedicalHistory').isIn(['No', 'Other']).withMessage('Medical History Family Medical History is required'),
    body('medicalHistory.medicationList').isIn(['No', 'Other']).withMessage('Medical History Medication List is required'),
    body('medicalHistory.allergies').isIn(['No', 'Other']).withMessage('Medical History Allergies is required'),
    body('insurance.provider').isIn(['No', 'Other']).withMessage('Insurance Provider is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      username,
      password,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      contactAddress,
      contactPhone,
      contactEmail,
      emergencyContact,
      medicalHistory,
      insurance,
      appointments,
    } = req.body;

    try {
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        username,
        password,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        contactAddress,
        contactPhone,
        contactEmail,
        emergencyContact,
        medicalHistory,
        insurance,
        appointments,
      });
      await user.save();

      res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
