require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Test PostgreSQL connection
const { pool } = require("./config/database");
pool.connect()
    .then(() => {
        console.log("Connected to PostgreSQL database!");
    })
    .catch((err) => {
        console.error("Error connecting to PostgreSQL:", err);
    });

// File upload configuration for local storage (replacing GridFS)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = "./uploads";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        if (file.mimetype === "application/pdf") {
            cb(null, `${Date.now()}-${file.originalname}`);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
});

const upload = multer({ storage });

// Routes
const citizenRoutes = require("./routes/citizen-routes");
const adminRoutes = require("./routes/admin-routes");
const otpRoutes = require("./routes/otp-routes.js");
const notificationsRoutes = require("./routes/notifications-routes.js");

app.use("/ccms/user", citizenRoutes);
app.use("/ccms/admin", adminRoutes);
app.use("/ccms/otp", otpRoutes);
app.use("/ccms/notifications", notificationsRoutes);

// Upload PDF endpoint
app.post("/ccms/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(201).json({
        fileId: req.file.filename,
        filename: req.file.filename,
    });
});

// Retrieve PDF by filename endpoint
app.get("/ccms/file/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
    });

    res.sendFile(filePath);
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.errorCode || 500);
    res.json({ message: error.message || "An unknown error occurred." });
});

app.use("/", (req, res, next) => {
    res.json({
        welcome:
            "Welcome to court case management system. Please follow README file for API Documentation and access all routes",
        ReadMe: "https://github.com/Aakash-mishra2/node-express-mongodb-court-case-management-backend#readme",
    });
});

const HttpError = require("./models/http_error");
app.use((req, res, next) => {
    // Redirect any unmatched routes to the root path
    res.redirect('/');
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = { pool };
