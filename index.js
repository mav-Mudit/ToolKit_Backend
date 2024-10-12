const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userController = require("./controller/user");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL_CONNECTION, (err) => {
  if (err) {
    console.log("DB Error");
  } else {
    console.log("DB Connected.");
  }
});
app.post("/register", userController.register);
app.post("/login", userController.login);
app.post("/submit-otp", userController.submitotp);
app.post("/send-otp", userController.sendotp);

app.listen(process.env.PORT, () => {
  console.log(`Backend Running At Port 5000`);
});
