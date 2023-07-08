const mongosse = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator=require("validator");

const UserSchema = new mongosse.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value){
    if(!validator.isEmail(value)){
      throw new Error("Email is invalid");
    }}
  },
  phone: {
    type: Number,
    required: true,
    
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
  },
  role: {
    type: String,
    required: true,
    lowercase: true,
    enum: ["admin", "user"],
    default: "user",
  },
});

// We are bcrypting password here

UserSchema.pre("save", async function (next) {
  console.log("Running pre funciton");
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

UserSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.date = Date.now();
    await this.save();
    console.log("Im token");
    return token;
  } catch (err) {
    console.log(err);
  }
};
const User = mongosse.model("SignUpForm", UserSchema);

module.exports = User;
