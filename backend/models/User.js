import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true },
  password: { type: String, select: false }, // only for respondents
  role:     { type: String, enum: ['customer', 'respondent'], default: 'customer' },
  createdAt:{ type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

const User = mongoose.model('User', userSchema);
export default User;
