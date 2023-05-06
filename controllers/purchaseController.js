const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const Order = require("../model/ordersModel");
const User = require("../model/usersModel");
const mongoose = require("mongoose");



exports.purchasePremium = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const instance = new Razorpay({
      key_id: process.env.APIKEY,
      key_secret: process.env.SECRETKEY,
    });
    const amount = 10000;
    const order = await instance.orders.create({ amount, currency: "INR" });

    session.startTransaction();
    try {
      await Order.create(
        [
          {
            usersTbId: req.user.userId,
            orderid: order.id,
            amount: order.amount,
            currency: order.currency,
            status: "PENDING",
            orderDate: order.created_at,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return res.status(201).json({ order, key_id: instance.key_id });
    } catch (err) {
      await session.abortTransaction();
      console.error(err);
      return res
        .status(403)
        .json({ message: "Something went wrong", error: err });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(403)
      .json({ message: "Something went wrong", error: err });
  } finally {
    session.endSession();
  }
};

const generateAccessToken = (id, name, ispremiumuser) => {
  return jwt.sign(
    { userId: id, name: name, ispremiumuser },
    process.env.JWT_SECRET_KEY
  );
};




exports.updateTransactionStatus = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { order_id, payment_id } = req.body;
    session.startTransaction();
    try {
        const order = await Order.findOneAndUpdate(
            { orderid: order_id },
            { $set: { paymentid: payment_id, status: "SUCCESSFUL" } },
            { new: true, session }
        );
      
      if (!order) {
        await session.abortTransaction();
        
        return res.status(404).json({ error: "order not found" });
      }
      const user=await User.findOneAndUpdate(
        { _id: req.user.userId },
        { ispremiumuser: true },
        { session }
      );
      await session.commitTransaction();
      return res.status(202).json({
        success: true,
        message: "Transaction Successful.!",
        token: generateAccessToken(user.id, user.name, true),
      });
    } catch (error) {
      await session.abortTransaction();
      console.error(error);
      return res.status(403).json({
        error,
        message: "Transaction Failed. Please try again",
        // token: generateAccessToken(user.id, user.name, user.ispremiumuser),
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error, message: "Something went wrong" });
  } finally {
    session.endSession();
  }
};
