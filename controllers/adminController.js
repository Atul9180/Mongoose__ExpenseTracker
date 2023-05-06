const ExpenseTrackerModel = require('../model/expensesModel')
const UserModel = require('../model/usersModel')


//@desc: to get all expenses
exports.getAllExpenses = async (req, res) => {
    const limit = parseInt(req.query.pageLimit) || parseInt(8);
    const page = parseInt(req.query.page) || parseInt(1);
    const offset = (page - 1) * limit;
    try {
        const [allExpenses, totalRow] = await Promise.all([
            ExpenseTrackerModel.find({
                usersTbId: req.user.userId})
                .limit(limit)
                .skip(offset)
            ,
            ExpenseTrackerModel.find({
                usersTbId: req.user.userId 
            }).countDocuments()
        ]);
        const totalPages = Math.ceil(totalRow / limit);
        res.status(200).json({ allExpenses: allExpenses, totalPages, currentPage: page,totalRow });
    } catch (err) {
        console.log('Error in fetching all expenses record with error: ',err);
        res.status(500).json({ error: err });
    }
};



//@desc: to get expense by id
exports.getExpenseById = async (req, res) => {
    const { id } = req.params;
    if (!id.trim()) {
        return res.status(400).json({ error: 'Expense Id of Updated user missing' });
    }
    try {
        const expense = await ExpenseTrackerModel.findOne({ _id:id, usersTbId: req.user.userId })
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(200).json({ updatedUserExpense: expense });
    } catch (error) {
        console.error(`Error in fetching expense by Id: ${error}`);
        res.status(500).json({ error });
    }
};



//@desc: addNew Expense and update Users's totalExpense
exports.addNewExpense = async (req, res) => {
  const { amount, description, category, amountType } = req.body;
  const usersTbId = req.user.userId;
  
  if (!amount.trim() || !description.trim() || !category.trim()) {
    throw new Error('All fields are mandatory');
  }
  
  try {
    const newExpense = await ExpenseTrackerModel.create(
      { amount, description, category, amountType, usersTbId });
    // let newTotal=0;
    // if (amountType === 'expense') {
    //   newTotal -=amount;
    // }
    // else{
    //     newTotal +=amount;
    // }
    await UserModel.findByIdAndUpdate(usersTbId,{ $inc: { totalExpense: amount } });
    res.status(201).json({ newAddedExpense: newExpense });
  } catch (err) {
    console.error(`Error in posting new expense: ${err}`);
    res.status(err.status || 500).json({ error: err.message || err });
  }
};





//@desc: delete Expense
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const { expAmount, expType } = req.query;
    if (!id.trim()) {
        return res.status(400).json({ error: 'Expense Id is missing while deleting.' })
    }
    try {
        const delres = await ExpenseTrackerModel.findOneAndDelete({ _id:id, usersTbId: req.user.userId } );
        if(!delres){
            return res.status(404).json({ error: 'Expense not found' });
        }        
        await UserModel.findByIdAndUpdate({ _id: req.user.userId },{ $inc: { totalExpense: -expAmount } });
        return res.sendStatus(200);
    } catch (err) {
        console.error(`Error in deleting expense: ${err}`);
        res.status(500).json({ error: err.message || err });
    }
}


//@desc: update expense
exports.updateExpense = async (req, res) => {
    const { amount, description, category, amountType, changedAmount, expType } = req.body;
    const { id } = req.params;
    if (!id.trim()) {
        return res.status(400).json({ error: 'Expense Id is missing for update.' })
    }
    if (!amount.trim() || !description || !category) {
        throw new Error('all fields mandatory')
    }
    try {
        const updatedExpense =await ExpenseTrackerModel.findOneAndUpdate({ _id:id, usersTbId: req.user.userId },{ amount, description, category, amountType }, { new: true });
       
        if(!updatedExpense){
            return res.status(404).json({error:"Expense not found"})
        }

        const user =await UserModel.findOne({ _id: req.user.userId });
        if (expType === 'expense') {
            user.totalExpense += parseInt(changedAmount);
            await user.save();
        }
        res.sendStatus(200);
    }
    catch (err) {
        console.error(`Error in updating expense: ${err}`);
        res.status(err.status || 500).json({ error: err.message || err });
  } 
}





