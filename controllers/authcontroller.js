const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const { generateToken } = require("../utils/generate");

module.exports.registerUser = async function (req, res) {
    try {
        let { email, password, fullname } = req.body;
        let user = await userModel.findOne({ email: email });
        if (user) return res.status(401).send("You already have an account, please log in.");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        user = await userModel.create({
            email,
            password: hash,
            fullname,
        });

        let token = generateToken(user);
        res.cookie("token", token);
        return res.redirect('/profile');
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error");
    }
};

    module.exports.loginUser=async function(req,res){
        let {email,password}=req.body;
        let user=await userModel.findOne({email:email})
        if(!user)return res.status(401).send("Email or Password incorrect");
        bcrypt.compare(password,user.password,function(err,result){
           if(result){
           let token=generateToken(user);
           res.cookie("token",token);
            return res.redirect('/profile');;
           }
           else{
            return res.status(401).send("Email or Password incorrect");
           }
        })

    }

    module.exports.logout = function (req, res) {
        res.cookie("token", "");
        res.redirect("/");
    }
