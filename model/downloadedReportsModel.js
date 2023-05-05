const mongoose = require("mongoose");

const downloadedReportSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    primaryKey: true,
    required: true,
  },
  usersTbId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    onDelete: 'CASCADE'
  },
},
  { timestamps: true });

const DownloadedReport = mongoose.model(
  "DownloadedReport",
  downloadedReportSchema
);

module.exports = DownloadedReport;
