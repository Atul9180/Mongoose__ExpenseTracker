const mongoose = require("mongoose");

const ForgotPasswordSchema = new mongoose.Schema({
  
  id: {
    type: String,
  },
  active: {
    type:Boolean,
  },
  usersTbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    onDelete: 'CASCADE'
  },
},
  { timestamps: true });

const ForgotPassword = mongoose.model("ForgotPassword", ForgotPasswordSchema);
module.exports = ForgotPassword;
