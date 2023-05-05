const User = require("../model/usersModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
require('dotenv').config();

function isNotValidInput(string){
  if(string==undefined || string.length==0){
      return true;
  }
  else{
      return false;
  }
}


//Signup Page Controller
const createNewUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(isNotValidInput(name)||isNotValidInput(email)||isNotValidInput(password)) {
      return res.status(400).json({ message: "All fields are mandatory" });
    } else {

      //check if useralready exists
      const isExistingUser= await User.findOne({email})
      if(isExistingUser){
        return res.status(200).send({
        success: true,
        message: "Email Id already registered. Please Login",
      });
      }
      const hashedPswd = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        password: hashedPswd,
      });
      return res.status(201).json({ UserAddedResponse: "Successfuly created new user.!" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      err,
    });
  }
};



//function generateAccessToken ...has(payload,secretkey) encrypt payload using secret key
const generateAccessToken = (id,name,ispremiumuser)=>{
  return jwt.sign({userId:id, name:name, ispremiumuser},process.env.JWT_SECRET_KEY)
}



//Login Page Controller
const authenticateUserController = async(req, res) => {
  try {
    const { email, password } = req.body;
    if(isNotValidInput(email)||isNotValidInput(password)) {
      return res.status(401).json({ message: "All fields are mandatory" ,success:false});
    }

    const user = await User.findOne({ email });
    if (user) {
       bcrypt.compare(password, user.password, (hasherr, hashresponse) => {
        if(hasherr){
          throw new Error("Something went wrong in authentication");
        }
        if (hashresponse === true) {        
          return res.status(200).json({ success:true,message: "User logged in successfully", token: generateAccessToken(user._id, user.name, user.ispremiumuser) });
        } 
        else if(hashresponse === false) {
          return res.status(401).json({ message: "User not authorized. Password Incorrect." });
        }
      });
    } else {
      return res.status(401).json({ message: "User not Registered" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports ={ createNewUserController ,
  generateAccessToken  ,
  authenticateUserController
}