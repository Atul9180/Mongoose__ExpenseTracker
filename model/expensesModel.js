const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    amount:{
        type: Number,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    amountType:{
        type: String,
        default: 'expense'
    },
    usersTbId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        onDelete: 'CASCADE'
  }
},
  { timestamps: true }
  )

 
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;