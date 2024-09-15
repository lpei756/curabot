import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DoctorModel from '../src/models/Doctor.js';
import AdminModel from '../src/models/Admin.js';

dotenv.config();
const doctors = [
    {
        "doctorID": "D001",
        "firstName": "Alice",
        "lastName": "Smith",
        "clinic": "66ac6360d1864aef73c64a69",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D002",
        "firstName": "Bob",
        "lastName": "Johnson",
        "clinic": "66ac6360d1864aef73c64a69",
        "languagesSpoken": ["English", "Mandarin"]
    },
    {
        "doctorID": "D003",
        "firstName": "Carol",
        "lastName": "Williams",
        "clinic": "66ac6360d1864aef73c64a69",
        "languagesSpoken": ["English", "Korean"]
    },
    {
        "doctorID": "D004",
        "firstName": "David",
        "lastName": "Brown",
        "clinic": "66ac6360d1864aef73c64a6a",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D005",
        "firstName": "Eva",
        "lastName": "Davis",
        "clinic": "66ac6360d1864aef73c64a6a",
        "languagesSpoken": ["English", "French"]
    },
    {
        "doctorID": "D006",
        "firstName": "Frank",
        "lastName": "Miller",
        "clinic": "66ac6360d1864aef73c64a6a",
        "languagesSpoken": ["English", "Spanish"]
    },
    {
        "doctorID": "D007",
        "firstName": "Grace",
        "lastName": "Wilson",
        "clinic": "66ac6360d1864aef73c64a6b",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D008",
        "firstName": "Henry",
        "lastName": "Moore",
        "clinic": "66ac6360d1864aef73c64a6b",
        "languagesSpoken": ["English", "German"]
    },
    {
        "doctorID": "D009",
        "firstName": "Ivy",
        "lastName": "Taylor",
        "clinic": "66ac6360d1864aef73c64a6b",
        "languagesSpoken": ["English", "Japanese"]
    },
    {
        "doctorID": "D010",
        "firstName": "James",
        "lastName": "Anderson",
        "clinic": "66ac6360d1864aef73c64a6c",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D011",
        "firstName": "Katie",
        "lastName": "Thomas",
        "clinic": "66ac6360d1864aef73c64a6c",
        "languagesSpoken": ["English", "Chinese"]
    },
    {
        "doctorID": "D012",
        "firstName": "Leo",
        "lastName": "Jackson",
        "clinic": "66ac6360d1864aef73c64a6c",
        "languagesSpoken": ["English", "Italian"]
    },
    {
        "doctorID": "D013",
        "firstName": "Mia",
        "lastName": "White",
        "Clinic": "66ac6360d1864aef73c64a6d",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D014",
        "firstName": "Nate",
        "lastName": "Harris",
        "clinic": "66ac6360d1864aef73c64a6d",
        "languagesSpoken": ["English", "Portuguese"]
    },
    {
        "doctorID": "D015",
        "firstName": "Olivia",
        "lastName": "Martin",
        "clinic": "66ac6360d1864aef73c64a6d",
        "languagesSpoken": ["English", "Russian"]
    },
    {
        "doctorID": "D016",
        "firstName": "Paul",
        "lastName": "Garcia",
        "clinic": "66ac6360d1864aef73c64a6e",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D017",
        "firstName": "Quinn",
        "lastName": "Martinez",
        "clinic": "66ac6360d1864aef73c64a6e",
        "languagesSpoken": ["English", "Vietnamese"]
    },
    {
        "doctorID": "D018",
        "firstName": "Rita",
        "lastName": "Rodriguez",
        "clinic": "66ac6360d1864aef73c64a6e",
        "languagesSpoken": ["English", "Thai"]
    },
    {
        "doctorID": "D019",
        "firstName": "Sam",
        "lastName": "Lee",
        "clinic": "66ac6360d1864aef73c64a6f",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D020",
        "firstName": "Tina",
        "lastName": "Perez",
        "clinic": "66ac6360d1864aef73c64a6f",
        "languagesSpoken": ["English", "Arabic"]
    },
    {
        "doctorID": "D021",
        "firstName": "Uma",
        "lastName": "Roberts",
        "clinic": "66ac6360d1864aef73c64a6f",
        "languagesSpoken": ["English", "Bengali"]
    },
    {
        "doctorID": "D022",
        "firstName": "Vera",
        "lastName": "Nelson",
        "clinic": "66ac6360d1864aef73c64a70",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D023",
        "firstName": "Will",
        "lastName": "Carter",
        "clinic": "66ac6360d1864aef73c64a70",
        "languagesSpoken": ["English", "Hebrew"]
    },
    {
        "doctorID": "D024",
        "firstName": "Xander",
        "lastName": "Mitchell",
        "clinic": "66ac6360d1864aef73c64a70",
        "languagesSpoken": ["English", "Persian"]
    },
    {
        "doctorID": "D025",
        "firstName": "Yara",
        "lastName": "Robinson",
        "clinic": "66ac6360d1864aef73c64a71",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D026",
        "firstName": "Zane",
        "lastName": "Cook",
        "clinic": "66ac6360d1864aef73c64a71",
        "languagesSpoken": ["English", "Turkish"]
    },
    {
        "doctorID": "D027",
        "firstName": "Anna",
        "lastName": "Ward",
        "clinic": "66ac6360d1864aef73c64a71",
        "languagesSpoken": ["English", "Greek"]
    },
    {
        "doctorID": "D028",
        "firstName": "Bella",
        "lastName": "Reed",
        "clinic": "66ac6360d1864aef73c64a73",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D029",
        "firstName": "Charlie",
        "lastName": "Kelly",
        "clinic": "66ac6360d1864aef73c64a73",
        "languagesSpoken": ["English", "Hindi"]
    },
    {
        "doctorID": "D030",
        "firstName": "Daisy",
        "lastName": "Cook",
        "clinic": "66ac6360d1864aef73c64a73",
        "languagesSpoken": ["English", "Swahili"]
    },
    {
        "doctorID": "D031",
        "firstName": "Eli",
        "lastName": "Morgan",
        "clinic": "66ac6360d1864aef73c64a74",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D032",
        "firstName": "Fiona",
        "lastName": "Cooper",
        "clinic": "66ac6360d1864aef73c64a74",
        "languagesSpoken": ["English", "Finnish"]
    },
    {
        "doctorID": "D033",
        "firstName": "George",
        "lastName": "Bell",
        "clinic": "66ac6360d1864aef73c64a74",
        "languagesSpoken": ["English", "Polish"]
    },
    {
        "doctorID": "D034",
        "firstName": "Hannah",
        "lastName": "Hughes",
        "clinic": "66ac6360d1864aef73c64a75",
        "languagesSpoken": ["English"]
    },
    {
        "doctorID": "D035",
        "firstName": "Isaac",
        "lastName": "Ward",
        "clinic": "66ac6360d1864aef73c64a75",
        "languagesSpoken": ["English", "Nepali"]
    },
    {
        "doctorID": "D036",
        "firstName": "Jade",
        "lastName": "Parker",
        "clinic": "66ac6360d1864aef73c64a75",
        "languagesSpoken": ["English", "Hungarian"]
    },
    {
        "doctorID": "D037",
        "firstName": "Mason",
        "lastName": "Young",
        "clinic": "66ac6360d1864aef73c64a76",
        "languagesSpoken": "English"
    },
    {
        "doctorID": "D038",
        "firstName": "Nina",
        "lastName": "Adams",
        "clinic": "66ac6360d1864aef73c64a76",
        "languagesSpoken": "English, Spanish"
    },
    {
        "doctorID": "D039",
        "firstName": "Oscar",
        "lastName": "Brooks",
        "clinic": "66ac6360d1864aef73c64a76",
        "languagesSpoken": "English, French"
    },
    {
        "doctorID": "D040",
        "firstName": "Parker",
        "lastName": "Gray",
        "clinic": "66ac6360d1864aef73c64a77",
        "languagesSpoken": "English"
    },
    {
        "doctorID": "D041",
        "firstName": "Quincy",
        "lastName": "Mitchell",
        "clinic": "66ac6360d1864aef73c64a77",
        "languagesSpoken": "English, German"
    },
    {
        "doctorID": "D042",
        "firstName": "Riley",
        "lastName": "Lewis",
        "clinic": "66ac6360d1864aef73c64a77",
        "languagesSpoken": "English, Japanese"
    },
    {
        "doctorID": "D043",
        "firstName": "Sarah",
        "lastName": "Walker",
        "clinic": "66ac6360d1864aef73c64a72",
        "languagesSpoken": "English"
    },
    {
        "doctorID": "D044",
        "firstName": "Thomas",
        "lastName": "Scott",
        "clinic": "66ac6360d1864aef73c64a72",
        "languagesSpoken": "English, Mandarin"
    },
    {
        "doctorID": "D045",
        "firstName": "Uma",
        "lastName": "Wright",
        "clinic": "66ac6360d1864aef73c64a72",
        "languagesSpoken": "English, Korean"
    }
]

async function createAdminsForExistingDoctors() {
    try {
        const existingDoctors = await DoctorModel.find({});
        for (const doctor of existingDoctors) {
            const existingAdmin = await AdminModel.findOne({ doctor: doctor._id });
            if (existingAdmin) {
                console.log(`Admin for Doctor ${doctor.firstName} ${doctor.lastName} already exists, skipping...`);
                continue;
            }
            const email = `${doctor.firstName.toLowerCase()}${doctor.doctorID}@clinic.com`;
            const admin = new AdminModel({
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                email,
                password: 'Pass123',
                role: 'doctor',
                doctor: doctor._id,
            });
            await admin.save();
            console.log(`Admin created for Doctor ${doctor.firstName} ${doctor.lastName} with email: ${email}`);
        }
    } catch (error) {
        console.error('Error creating admins for doctors:', error);
    }
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        createAdminsForExistingDoctors();
    })
    .catch((err) => console.error('MongoDB connection error:', err));
