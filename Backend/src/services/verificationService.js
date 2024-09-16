import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

export const sendVerificationCode = async (email) => {
    const user = await User.findOne({ email });
    if (user) throw new Error('Email is already registered');

    const verificationCode = crypto.randomBytes(3).toString('hex');
    const emailContent = `Your verification code is: ${verificationCode}`;

    await sendEmail(email, 'Email Verification Code', emailContent);

    await User.updateOne({ email }, { $set: { verificationCode } }, { upsert: true });

    return { message: 'Verification code sent to email' };
};

export const verifyCodeAndRegister = async (userData) => {
    const {
        email,
        verificationCode,
        password,
        firstName,
        lastName,
        phone,
        address,
        dateOfBirth
    } = userData;

    const user = await User.findOne({ email });
    if (!user) throw { status: 422, message: 'User not found' };
    if (user.verificationCode !== verificationCode) throw { status: 422, message: 'Invalid verification code' };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.address = address;
    user.dateOfBirth = dateOfBirth;
    user.isVerified = true;
    user.verificationCode = null;

    if (!user.patientID) {
        user.patientID = crypto.randomInt(100000, 1000000).toString();
        const letters = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 3);
        const numbers = Math.floor(1000 + Math.random() * 9000);
        user.nhi = `${letters}${numbers}`;
    }

    await user.save();

    return {
        message: 'Registration successful',
        user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            dateOfBirth: user.dateOfBirth,
            patientID: user.patientID,
            nhi: user.nhi
        }
    };
};
