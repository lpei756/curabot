import mongoose from 'mongoose';

const FaQsSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true }
});

const FaQSchema = mongoose.model('FaQs', FaQsSchema);

export default FaQSchema;