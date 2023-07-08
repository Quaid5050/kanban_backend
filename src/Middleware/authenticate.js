const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");

const Authenticate = async (req, res, next) => {

  try {
    const token = req.cookies.jwttoken;
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    const rootUSer = await User.findOne({ _id: verifyToken._id });
    if (!rootUSer) {
      throw new Error("User Not Found"); 
    }
    
    req.token = token;
  
    req.RUser = rootUSer;
    next();
  } catch (err) {
    res.status(400).send({ stat: "wrong", error: "Error occured" });
    console.log("My error is " + err);
  }
};

module.exports = Authenticate;
