const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  paymentid: { type: String },
  orderid: { type: String },
  status: { type: String },
  usersTbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    onDelete: 'CASCADE'
  },
},
  { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;