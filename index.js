import * as dotenv from "dotenv";
import express from "express";
import itemRoutes from "./app/routes/items.routes.js";
import mongoose from "mongoose";

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
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

const app = express();

app.use("/api/items", itemRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Order Booking app!",
  });
});
// require("./app/routes/organizer.routes.js")(app);

app.listen(port, () => console.log(`Server started on port ${port}`));
