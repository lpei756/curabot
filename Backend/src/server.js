import connectDB from './config/database.js';
import app from './app.js';
import './services/scheduler.js';

if (process.env.NODE_ENV !== 'production') {
    import('dotenv').then(dotenv => {
        dotenv.config();
        console.log("Development environment variables loaded");
    }).catch(error => {
        console.error("Failed to load dotenv", error);
    });
}

connectDB()
    .then(() => console.log("Database connected successfully"))
    .catch((error) => console.error("Database connection failed:", error));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
