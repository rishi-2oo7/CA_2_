const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const Feedback = require("./models/feedback");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/api/admin/database", async (req, res) => {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        return res.status(503).json({
            status: "Disconnected",
            database: mongoose.connection.name || "studentFeedback",
            collections: [],
            totalRecords: 0,
            feedback: []
        });
    }

    try {
        const [collections, feedback, totalRecords] = await Promise.all([
            mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray(),
            Feedback.find().lean(),
            Feedback.countDocuments()
        ]);

        res.status(200).json({
            status: "Connected",
            database: mongoose.connection.name,
            collections: collections.map((collection) => collection.name),
            totalRecords,
            feedback
        });
    } catch (err) {
        console.error("Failed to load dashboard data:", err.name);
        res.status(500).json({
            status: "Disconnected",
            database: mongoose.connection.name || "studentFeedback",
            collections: [],
            totalRecords: 0,
            feedback: []
        });
    }
});

app.post("/api/feedback", async (req, res) => {
    try {
        const { studentName, courseName, message, rating } = req.body || {};

        if (
            typeof studentName !== "string" ||
            studentName.trim() === "" ||
            typeof courseName !== "string" ||
            courseName.trim() === "" ||
            typeof message !== "string" ||
            message.trim() === "" ||
            typeof rating !== "number" ||
            !Number.isFinite(rating)
        ) {
            return res.status(400).json({
                message: "studentName, courseName, and message must be non-empty strings, and rating must be a number"
            });
        }

        const feedback = new Feedback({
            studentName,
            courseName,
            message,
            rating
        });

        await feedback.save();

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ message: err.message });
        }

        console.error("Failed to save feedback:", err.name);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/feedback", async (req, res) => {
    try {
        const pageValue = req.query.page === undefined ? "1" : req.query.page;
        const limitValue = req.query.limit === undefined ? "5" : req.query.limit;

        if (
            typeof pageValue !== "string" ||
            !/^\d+$/.test(pageValue) ||
            typeof limitValue !== "string" ||
            !/^\d+$/.test(limitValue)
        ) {
            return res.status(400).json({
                message: "Page and limit must be positive integers"
            });
        }

        const page = Number(pageValue);
        const limit = Number(limitValue);

        if (
            !Number.isSafeInteger(page) ||
            page < 1 ||
            !Number.isSafeInteger(limit) ||
            limit < 1
        ) {
            return res.status(400).json({
                message: "Page and limit must be positive integers"
            });
        }

        const skip = (page - 1) * limit;

        const [feedback, totalRecords] = await Promise.all([
            Feedback.find().skip(skip).limit(limit),
            Feedback.countDocuments()
        ]);

        res.status(200).json({
            currentPage: page,
            totalRecords,
            feedback
        });
    } catch (err) {
        console.error("Failed to retrieve feedback:", err.name);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.patch("/api/feedback/:id", async (req, res) => {
    try {
        const { status } = req.body || {};

        if (typeof status !== "string" || !["Pending", "Reviewed"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Pending or Reviewed"
            });
        }

        if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            return res.status(400).json({
                message: "Invalid feedback ID"
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { reviewStatus: status },
            { new: true, runValidators: true }
        );

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Feedback review status updated successfully",
            feedback
        });
    } catch (err) {
        console.error("Failed to update feedback:", err.name);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON request body" });
    }

    console.error("Request failed:", err.name || "Error");
    return res.status(500).json({ message: "Internal server error" });
});

async function startServer() {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set in the .env file");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error("MongoDB connection failed. Check MONGO_URI and Atlas Network Access.");
        process.exit(1);
    }
}

startServer();