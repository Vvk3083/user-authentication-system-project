const express = require('express');

const userroute = express();
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middleware/auth');

userroute.use(session({secret:config.sessionSecret}));

userroute.set('view engine','ejs');
userroute.set('views','./views/users');

const bodyParser = require('body-parser');

const userController = require('../controllers/userController');
userroute.use(bodyParser.json());
userroute.use(bodyParser.urlencoded({extended:true}));

const multer = require('multer');
const path = require('path');

const static_path = path.join(__dirname, "../public");
userroute.use(express.static('public'));
userroute.use("/css", express.static(static_path));
userroute.use("/js", express.static(static_path));
userroute.use("/image", express.static(static_path));


userroute.get('/register',auth.isLogout,userController.loadRegister);
userroute.post('/register',userController.insertUser);

userroute.get('/',auth.isLogout,userController.loginLoad);
userroute.get('/login',auth.isLogout,userController.loginLoad);
userroute.post('/login',userController.verifyLogin);
userroute.get('/home',auth.isLogin,userController.loadHome);
userroute.get('/logout',auth.isLogin,userController.userLogout);
userroute.get('/forget',auth.isLogout,userController.forgetLoad);
userroute.post('/forget',userController.verifyForget);
userroute.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
userroute.post('/forget-password',userController.resetPassword);


module.exports = userroute;