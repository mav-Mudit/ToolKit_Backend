const UserModel = require("../models/user");
const nodemailer = require("nodemailer");
const fs= require('fs')
const bcrypt = require("bcryptjs");
const user = require("../models/user");

module.exports.register = async (req, res) => {
  console.log(req.body);
  try {
    if (req.body.name !== "" &&req.body.email !== "" &&  req.body.password !== "") {
      // email should not exist alreday
      let userExists = await UserModel.findOne({ email: req.body.email });
      var hash = bcrypt.hashSync(req.body.password, 10);
      if (userExists) {
        return res.send({ code: 404, message: "User Already Exists" });
      }
      // To authenticate the incoming password string with the hash stored in the database :
      const newUser = new UserModel({
        name: req.body.name,
        email: req.body.email,
        password: hash,
      });
      newUser
        .save()
        .then(() => {
          res.send({ code: 200, message: "Signup Success" });
        })
        .catch((err) => {
          res.send({ code: 500, message: "Signup Error" });
        });
    } else {
      return res.send({ code: 408 });
    }
  } catch (err) {console.log(err);}
};

module.exports.login = (req, res) => {
  console.log(req.body.email);
  // email and password match
  if (req.body.email !== "" && req.body.password !== "") {
    UserModel.findOne({ email: req.body.email })
    .then((result) => {
      console.log(result, "11");
      // var hash = bcrypt.hashSync(req.body.password, 10);
      const passCompare = bcrypt.compare(req.body.password, result.password);
      // match password with req.body.password
      if (!passCompare) {
        res.send({ code: 404, message: "Password wrong" });
      } else {
        res.send({
          email: result.email,
          code: 200,
          message: "User Found",
          token: "hfgdhg",
        });
      }
    })
    .catch((err) => {
      res.send({
        code: 500,
        message: "User Not Found! Register then try again..",
      });
    });
  }else{ return res.send({code:408 ,message : "Empty input values!"})}
};

module.exports.sendotp = async (req, res) => {
  console.log(req.body);
  if (req.body.email !== "") {
  const _otp = Math.floor(100000 + Math.random() * 900000);
  console.log(_otp);
  const user = await UserModel.findOne({ email: req.body.email });
  // send to user mail
  if (!user) {
    res.send({ code: 500, message: "User not found!" });
  }
  let mailTransporter = nodemailer.createTransport({
  service:'gmail',
  auth:{user:'bpay1009@gmail.com',pass:'hwmovpxrdhscwvsh'}
  });

  let info = await mailTransporter.sendMail({
  from: "bpay1009@gmail.com",
  to: req.body.email, // list of receivers
  subject: "OTP", // Subject line
  text: String(_otp),
  html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + _otp + "</h1>" + "<p>Otp expires in <time /></p>"
  });
  if (info.messageId) {
    console.log(info, 84);
    UserModel.updateOne({ email: req.body.email }, { otp: _otp })
      .then((result) => {
        res.send({ code: 200, message: "Otp send" });
      })
      .catch((err) => {
        res.send({ code: 500, message: "Server err" });
      });
  } else {
    res.send({ code: 500, message: "Server err" });
  }}
  else{res.send({code:408,message:"Empty input fields"})}
};
module.exports.submitotp = (req, res) => {
  console.log(req.body);
  if (req.body.otp !== "" && req.body.password !== "") {
  UserModel.findOne({ otp: req.body.otp })
    .then((result) => {
      //  update the password
      var hash = bcrypt.hashSync(req.body.password, 10);
      UserModel.updateOne({ email: result.email }, { password: hash })
        .then((result) => {
          res.send({ code: 200, message: "Password updated" });
        })
        .catch((err) => {
          res.send({ code: 500, message: "Server err" });
        });
    })
    .catch((err) => {
      res.send({ code: 500, message: "Otp is Wrong" });
    });
  }
  else{ return res.send({code:408 , message:"Empty input values!"})}
};
