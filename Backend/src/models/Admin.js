import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  adminID: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['superadmin', 'doctor', 'nurse'],
    required: true
  },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 在保存之前生成唯一的 adminID 并加密密码
AdminSchema.pre('save', async function (next) {
  if (this.isNew) {
    // 生成唯一的 adminID
    this.adminID = crypto.randomInt(100000, 1000000).toString();

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// 创建模型
const AdminModel = mongoose.model('Admin', AdminSchema);
export default AdminModel;
