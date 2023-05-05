const Expense = require("../model/expensesModel");
const User = require("../model/usersModel");
const DownloadedReport = require('../model/downloadedReportsModel')
const { uploadToS3 } = require('../services/awsS3service')



//@desc: get leaderBoard
const getLeadersData = async (req, res) => {
  try {
    const leadersExpenses = await User.aggregate([
      {
        $lookup: {
          from: 'expenses',
          localField: '_id',
          foreignField: 'usersTbId',
          as: 'expenses',
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          aggregate_amount: {
            $sum: { $ifNull: ['$expenses.amount', 0] },
          },
        },
      },
      { $sort: { aggregate_amount: -1 } },
    ]);
    res.json(leadersExpenses);
       
  } catch (err) {
    console.log("Error in fetching leaders data, error: ", JSON.stringify(err));
    res.status(500).json(err.message);
  }
};



//@desc: get the report downloaded
const getExpenseReport = async (req, res) => {
  try {
    const usersTbId = req.user.userId;
    const overAllExpenses = await Expense.find({ usersTbId })
    if (overAllExpenses.length) {
      const stringifiedExpenses = JSON.stringify(overAllExpenses)

      const fileName = `expensereport${usersTbId}/${new Date()}.json`;
      const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
      if (fileUrl) {
        await DownloadedReport.create({ fileUrl, usersTbId });
        return res.status(200).json({ fileUrl, success: true })
      }
    }
    else {
      return res.json({ message: "no data exists..", success: false })
    }
  } catch (err) {
    console.log("Error in fetching expenses data, error: ", err);
    res.status(500).json({ fileUrl: "", success: false, err });
  }
}



//@desc: show downloaded reports history
const showUsersDownloads = async (req, res) => {
  try {
    const usersTbId = req.user.userId;
    const prevDownloads = await DownloadedReport.find({ usersTbId })
    if (prevDownloads.length) {
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