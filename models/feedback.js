const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewStatus: {
        type: String,
        enum: ["Pending", "Reviewed"],
        default: "Pending"
    }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
