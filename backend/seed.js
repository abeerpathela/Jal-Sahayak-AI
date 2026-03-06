import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Remove old test staff if exists
    await User.deleteMany({ email: 'officer@jalshakti.gov.in' });

    // Create a new staff account
    // Password will be hashed by the pre-save hook in User model
    const staff = await User.create({
      name: 'Senior Officer Rajesh',
      email: 'officer@jalshakti.gov.in',
      password: 'staff123',
      role: 'respondent'
    });

    console.log('✅ Staff Account Created Successfully!');
    console.log('Email: officer@jalshakti.gov.in');
    console.log('Password: staff123');
    console.log('\nYou can now login to the Staff Portal on the landing page.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedStaff();
