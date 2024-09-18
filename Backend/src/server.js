import dotenv from 'dotenv';
import connectDB from './config/database.js';
import app from './app.js';
import './services/scheduler.js';

dotenv.config();
console.log("Environment variables loaded");
connectDB()
    .then(() => console.log("Database connected successfully"))
    .catch((error) => console.error("Database connection failed:", error));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
