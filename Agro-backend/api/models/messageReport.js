// 1) Imports
const mongoose = require("mongoose");

// 2) Create Schema
const messageReportSchema = mongoose.Schema(
  {
    _id: mongoose.Types.ObjectId,
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupChat",
      required: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUsername: {
      type: String,
      required: true,
      trim: true,
    },
    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporterUsername: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "Ανάρμοστο περιεχόμενο",
        "Παρενόχληση ή εκφοβισμός",
        "Spam ή ανεπιθύμητα μηνύματα",
        "Ψευδείς πληροφορίες",
        "Προσβλητική γλώσσα",
        "Άλλο"
      ],
    },
    reportedText: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    reviewedAt: {
      type: Date,
      required: false,
    },
    reviewNotes: {
      type: String,
      required: false,
      trim: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// 3) Create indexes for better query performance
messageReportSchema.index({ messageId: 1 }); // For querying reports by message
messageReportSchema.index({ reportedUserId: 1 }); // For querying reports by reported user
messageReportSchema.index({ reporterUserId: 1 }); // For querying reports by reporter
messageReportSchema.index({ status: 1 }); // For querying reports by status
messageReportSchema.index({ reportDate: -1 }); // For sorting by report date

// 4) Prevent duplicate reports for same message by same user
messageReportSchema.index({ messageId: 1, reporterUserId: 1 }, { unique: true });

// 5) Export
module.exports = mongoose.model("MessageReport", messageReportSchema);