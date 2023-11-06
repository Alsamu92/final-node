const mongoose = require('mongoose');

const validator = require('validator');
const bcrypt=require("bcrypt")
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, 'Email not valid'],
    },
    name: { type: String, required: true, trim: true, unique: true },
    provincia: { type: String, required: false, trim: true, unique: false},
    password: {
      type: String,
      required: true,
      trim: true,
      validate: [validator.isStrongPassword],
      minlength: [8, 'Min 8 characters'],
    },
    gender: {
      type: String,
      enum: ['hombre', 'mujer'],
      required: true,
    },
    rol: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
    },
    confirmationCode: {
      type: Number,
      required: true,
    },
    check: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
    ArticuloFav: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Articulo' }],
    SupermercadoFav: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supermercado" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);
UserSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next('Error hashing password', error);
  }
});


const User = mongoose.model('User', UserSchema);
module.exports = User;