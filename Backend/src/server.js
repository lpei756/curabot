const dotenv = require('dotenv');
const connectDB = require('./config/database');
const app = require('./app');

dotenv.config();

connectDB();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

