const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const config = require('../config/config');

const securePassword = async(password) => {
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}

//for reset password mail send
const sendResetPasswordMail = async(name,email,token)=>{
    try{
        const transporter = nodemailer.createTransport({
            // host:'smtp.ethereal.email',
            host:'smtp.gmail.com',
            // host:'smtp.mandrillapp.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from : config.emailUser,
            to : email,
            subject : 'For reset password',
            html: '<p> Hi '+name+', please click here to <a href="http://localhost:8080/forget-password?token='+token+'"> Reset </a> your account password </p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent :- ",info.response);
            }
        })

    } catch(error){
        console.log(error.message);
    }
}

const loadRegister = async(req,res) => {
    try{
        res.render('registration');
    }catch(error){
        console.log(error.message);
    }
}

const loadHome = async(req,res) => {
    try{
        const userData = await User.findById({_id:req.session.user_id});
        res.render('home',{user:userData});
    }catch(error){
        console.log(error.message);
    }
}

const insertUser = async(req,res) => {
    try{
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name : req.body.name,
            email : req.body.email,
            password : spassword,
        });

        const userData = await user.save();

        if(userData){
            res.render('registration',{message:"Your registration has been successful.Go to Login"});
        }else{
            res.render('registration',{message:"Your registration has failed. Retry!!!"});
        }

    } catch(error){
        console.log(error.message);
    }
}

//login user
const loginLoad = async(req,res) =>{
    try{
        res.render('login')
    } catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email: email});

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_verified === 0){
                    res.render('login',{message:"Please verify your email"});
                }else{
                    req.session.user_id=userData._id;
                    res.redirect('/home');
                }
            }else{
                res.render('login',{message:"Email and password is incorrect"});
            }
        }else{
            res.render('login',{message:"Email and password is incorrect"});
        }


    } catch(error){
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
    try {

        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad = async(req,res) =>{
    try{
        res.render('forget')
    } catch(error){
        console.log(error.message);
    }
}

const verifyForget = async(req,res) =>{
    try{
        const email = req.body.email;

        const userData = await User.findOne({email: email});

        if(userData){
            
            if(userData.is_verified === 0){
                res.render('login',{message:"Please verify ur email"});
            }else{
                const randomString = randomstring.generate();
                const updateData = await User.updateOne({email:email},{$set : {token: randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:"Check your Email to find link to reset your password"});
            }
            
        }else{
            res.render('forget',{message:"Email not registered"});
        }

    } catch(error){
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res) =>{
    try{

        const token = req.query.token;
        const tokenData = await User.findOne({token: token});
        console.log('tokenData:', tokenData);

        if(tokenData && tokenData._id){
            
            res.render('forget-password',{user_id:tokenData._id});
            
        }else{
            res.render('404',{message:"Page not Found"});
        }

    } catch(error){
        console.log(error.message);
    }
}

const resetPassword = async(req,res) =>{
    try{

        // const password = req.query.password;
        // const user_id = req.query.user_id;

        const password = req.body.password;
        const user_id = req.body.user_id;  


        const secure_password = await securePassword(password);
        const updateData = await User.findByIdAndUpdate({_id: user_id}, {$set : {password:secure_password, token:''}});

        res.redirect('/');

    } catch(error){
        console.log(error.message);
    }
}


module.exports ={
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    verifyForget,
    forgetPasswordLoad,
    resetPassword,
}