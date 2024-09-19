import dotenv from 'dotenv';
import connectDB from './config/database.js';
import app from './app.js';
import './services/scheduler.js';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
