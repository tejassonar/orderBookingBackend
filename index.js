import * as dotenv from "dotenv";
import express from "express";
import itemRoutes from "./app/routes/items.routes.js";
import userRoutes from "./app/routes/user.routes.js";
import partyRoutes from "./app/routes/party.routes.js";
import orderRoutes from "./app/routes/order.routes.js";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { notFound, errorHandler } from "./app/middleware/errorHandler.js";
import fs from "fs";
import path from "path";

dotenv.config();
const port = process.env.PORT || 5000;

const url = process.env.MONGO_URI;
// Connecting to the database
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const folderPath = `${process.cwd()}/uploads`;

    // Read the folder contents
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("Error reading folder:", err);
        return;
      }

      // Loop through the files and delete each one
      files.forEach((file) => {
        const filePath = path.join(folderPath, file);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log(`Deleted ${file}`);
          }
        });
      });
    });
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/orders", orderRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Order Booking app!",
  });
});
app.use(notFound);
app.use(errorHandler);
// require("./app/routes/organizer.routes.js")(app);

app.listen(port, () => console.log(`Server started on port ${port}`));
