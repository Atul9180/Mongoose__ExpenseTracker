const Expense = require("../model/expensesModel");
const User = require("../model/usersModel");
const Downloads = require('../model/downloadedReportsModel')
const { uploadToS3 } = require('../services/awsS3service')



//@desc: get leaderBoard
const getLeadersData = async (req, res) => {
  try {
    const leadersExpenses = await User.find({},{ name: 1, totalExpense: 1 })
      .sort({ totalExpense: -1 })
      .exec();
    res.json(leadersExpenses);
  } catch (err) {
    console.log("Error in fetching leaders data, error: ", JSON.stringify(err));
    res.status(500).json(err.message);
  }
};
  




const getExpenseReport = async (req, res) => {
  try {
    const usersTbId = req.user.userId;
    const overAllExpenses = await Expense.find({ usersTbId } )
    if (overAllExpenses) {
      const stringifiedExpenses = JSON.stringify(overAllExpenses)

      const fileName = `expensereport${usersTbId}/${new Date()}.json`;
      const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
      if (fileUrl) {
        await Downloads.create({ fileUrl, usersTbId });
        return res.status(200).json({ fileUrl, success: true })
      }
    }
    else {
      return res.json({ message: "no data exists..", success: false })
    }
  } catch (err) {
    console.log("Error in fetching expenses data, error: ", err);
    res.status(500).json({ fileUrl: '', success: false, err });
  }
}



//@desc: show downloaded reports history
const showUsersDownloads = async (req, res) => {
  try {
    const usersTbId = req.user.userId;
    const prevDownloads = await Downloads.find({ usersTbId })
    if (prevDownloads) {
      return res.status(200).json({ prevDownloads, success: true })
    }
    else {
      return res.json({ message: "No previous Downloads..", success: false })
    }
  } catch (err) {
    console.log("Error in fetching previous Downloads data , error: ", err);
    res.status(500).json(err.message);
  }
}


module.exports = { getLeadersData, getExpenseReport, showUsersDownloads }