import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';

dotenv.config();

jest.mock('mongoose');

describe('connectDB', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
        process.exit = jest.fn();
    });

    it('should connect to MongoDB successfully', async () => {
        mongoose.connect.mockResolvedValueOnce(true);

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
        expect(console.log).toHaveBeenCalledWith('MongoDB Connected.');
    });

    it('should handle connection errors', async () => {
        const errorMessage = 'Connection error';
        mongoose.connect.mockRejectedValueOnce(new Error(errorMessage));

        console.error = jest.fn();

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
        expect(console.error).toHaveBeenCalledWith(errorMessage);
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});
