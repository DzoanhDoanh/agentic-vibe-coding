require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Branch = require('./models/Branch');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tutoring_center')
  .then(() => console.log('DB Connected via Seeder'))
  .catch((err) => {
    console.log('Error', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    await User.deleteMany();
    await Branch.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('123456', salt);

    // Create Super Admin
    await User.create({
      email: 'admin@system.com',
      password_hash,
      full_name: 'Super Admin',
      role: 'SuperAdmin'
    });

    // Create a Branch
    const branch = await Branch.create({
      name: 'Chi Nhánh Hà Nội',
      address: '123 Cầu Giấy',
      contact_phone: '0988888888'
    });

    // Create a Branch Admin
    await User.create({
      email: 'branch_hn@system.com',
      password_hash,
      full_name: 'Admin Hà Nội',
      role: 'BranchAdmin',
      branch_id: branch._id
    });

    // Create a Teacher
    await User.create({
      email: 'teacher@system.com',
      password_hash,
      full_name: 'Giáo Viên A',
      role: 'Teacher',
      branch_id: branch._id
    });

    console.log('Data Imported - Seed Success! (Password is "123456" for all)');
    process.exit();
  } catch (error) {
    console.error('Error with seed data', error);
    process.exit(1);
  }
};

seedData();
