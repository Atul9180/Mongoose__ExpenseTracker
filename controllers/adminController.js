const Expense = require('../model/expensesModel')


exports.getAllExpenses = async (req, res) => {
    try {
        const limit = parseInt(req.query.pageLimit) || parseInt(8);
        const page = parseInt(req.query.page) || parseInt(1);
        const offset = (page - 1) * limit;

        const [allExpenses, totalRow] = await Promise.all([
            Expense.find({
                usersTbId: req.user.userId})
                .limit(limit)
                .skip(offset)
            ,
            Expense.find({
                usersTbId: req.user.userId 
            }).countDocuments()
        ]);
        const totalPages = Math.ceil(totalRow / limit);

        res.status(200).json({ allExpenses, totalPages, currentPage: page,totalRow });
    } catch (err) {
        console.log('Error in fetching all expenses record with error: ', JSON.stringify(err));
        res.status(500).json({ error: err });
    }
};




exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.trim()) {
            return res.status(400).json({ error: 'Expense Id of Updated user missing' });
        }
        const expense = await Expense.findOne({
            _id:id,
            usersTbId: req.user.userId 
        });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(200).json({ updatedUserExpense: expense });
    } catch (error) {
        console.error(`Error in fetching expense by Id: ${error}`);
        res.status(500).json({ error });
    }
};



//addNew Expense Post Request
exports.addNewExpense = async (req, res) => {
    try {
        const { amount, description, category, amountType } = req.body;
        const usersTbId = req.user.userId;
        if (!amount.trim() || !description.trim() || !category.trim()) { throw new Error('all fields mandatory') }
        const newExpense = await Expense.create({
            amount, description, category, amountType, usersTbId
        })
        res.status(201).json({ newAddedExpense: newExpense })
    }
    catch (err) {
        console.error(`Error in posting new expense: ${err}`)
        res.status(err.status || 500).json({ error: err.message || err })
    }
}




//delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id.trim()) {
            return res.status(400).json({ error: 'Expense Id is missing while deleting.' })
        }
        const delres = await Expense.deleteOne({_id:id, usersTbId: req.user.userId } );
        if (delres.deletedCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.sendStatus(200)
    }
    catch (err) {
        console.error(`Error in deleting expense: ${err}`);
        res.status(500).json({ error: err.message || err })
    }
}




//update expense
exports.updateExpense = async (req, res) => {
    try {
        const { amount, description, category, amountType } = req.body;
        const { id } = req.params;
        if (!id.trim()) { return res.status(400).json({ error: 'Expense Id is missing for update.' }) }
        if (!amount.trim() || !description || !category) { throw new Error('all fields mandatory') }
        const result = await Expense.findOneAndUpdate(
            {_id:id,usersTbId: req.user.userId},
            {amount, description, category, amountType },
            {new:true}         
        );
        if (!result) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.sendStatus(200)
    }
    catch (err) {
        console.error(`Error in updating expense: ${err}`);
        res.status(err.status || 500).json({ error: err.message || err })
    }
}



