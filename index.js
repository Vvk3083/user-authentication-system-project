const mongoose = require("mongoose");
const config = require('./config/config');

mongoose.connect(config.mongoURI);

const express = require("express");
const app= express();
const PORT = process.env.PORT || 8080;

//user
const userroute = require('./routes/userRoute');
app.use('/',userroute);

app.listen(PORT, function(){
    console.log(`http://localhost:${PORT}/`);
});