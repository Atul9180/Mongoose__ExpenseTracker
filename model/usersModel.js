const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ispremiumuser: { type:Boolean, default: false },
  },
  { timestamps: true }
);

// export default mongoose.model("users_tb", userSchema);
const User = mongoose.model("User", userSchema);
module.exports = User;
