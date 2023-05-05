const Order = require('../model/ordersModel');
const User = require('../model/usersModel');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.purchasePremium = async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id:process.env.R_APIKEY,
            key_secret:process.env.R_SECRETKEY
        });
         console.log("line 12 purcgase controller: ",{instance})
        const amount = 10000;
        const order = await instance.orders.create({ amount, currency: 'INR' });
        console.log("line 14 purcgase controller: ",{order})
        console.log({usersTbId: req.user.userId,
            orderid: order.id,
            amount: order.amount,
            currency: order.currency,
            status: 'PENDING',
            orderDate: order.created_at})

           const val= await Order.create({
            usersTbId: req.user.userId,
            orderid: order.id,
            amount: order.amount,
            currency: order.currency,
            status: 'PENDING',
            orderDate: order.created_at
        });
         console.log("line 32 purcgase controller: ",{val})
        return res.status(201).json({ order, key_id: instance.key_id });
    } catch (err) {
        console.error(err);
        return res.status(403).json({ message: 'Something went wrong', error: err });
    }
};


const generateAccessToken = (id, name, ispremiumuser) => {
    return jwt.sign({ userId: id, name: name, ispremiumuser }, process.env.JWT_SECRET_KEY)
}


exports.updateTransactionStatus = async (req, res) => {
    try {
        const { order_id, payment_id } = req.body;
        

        const orderSuccessPromise = Order.findOneAndUpdate({ orderid: order_id },{ paymentid: payment_id, status: 'SUCCESSFUL' },{new:true});
        const premUserPromise= User.findOneAndUpdate({ _id: req.user.userId},{ ispremiumuser: true },{new:true});

        const result= await Promise.all([orderSuccessPromise,premUserPromise])

        if(result[0].nModified === 0 || result[1].nModified === 0){
            await Order.findOneAndUpdate({orderid: order_id  },{ status: 'FAILED', paymentid: payment_id });
            return res.status(401).json({ success: false, message: 'Transaction Failed. Please try again' });
        }
        console.log("line 60 output of promiseall purchase controller: ",{result})
        // return res.status(202).json({ success: true, message: 'Transaction Successful.!', token: generateAccessToken(user.id, user.name, true) });  
        return res.status(202).json({ success: true, message: 'Transaction Successful.!' }); 
         
            
    } catch (error) {
        console.error(error);
    }
};
