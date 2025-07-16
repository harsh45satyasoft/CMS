const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
require("dotenv").config();

const menuTypeRoutes = require("./routes/menuTypeRoutes");
const cmsPageRoutes = require("./routes/cmsPageRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup, Load your API documentation from a swagger.json file. Serve an interactive UI at /api-docs
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger.json", "utf8"));   //fs.readFileSync("./swagger.json", "utf8") Reads the contents of the file named swagger.json from the root folder. "utf8" ensures it's read as a text string (not a buffer). Converts the Swagger JSON string into a JavaScript object so it can be used in your app.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));         //Mounts Swagger UI middleware at the route: /api-docs, swaggerUi.serve: Middleware that serves required static files (HTML, CSS, JS) for Swagger UI, swaggerUi.setup(swaggerDocument): Initializes Swagger UI with your loaded Swagger JSON (swaggerDocument)

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cms_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/menu-types", menuTypeRoutes);
app.use("/api/cms-pages", cmsPageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});