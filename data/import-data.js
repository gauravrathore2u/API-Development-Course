const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userModel = require('../model/userModel');
const { log } = require('util');

dotenv.config({path: './config.env'});

const DB = process.env.MONGODB_URL.replace("<PASSWORD>", process.env.MONGODB_PASSWORD);


mongoose.connect(DB, {
    useNewUrlParser: true
}).then((con)=>{
    // console.log(con.connection);
    console.log("db is successfully connected");
})


const userData = JSON.parse(fs.readFileSync(__dirname+'/user.json', 'utf-8'));

//import all data saved in file to the db
const importUsers = async ()=>{
    try {
        await userModel.create(userData);
        console.log("all users are saved to db");
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

//delete all the data in the db
const deleteUsers = async()=>{
    try {
        await userModel.deleteMany();
        console.log('All users are deleted from db');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

console.log(process.argv);


// To save all the data in the user.js file run the comman  as:- node data/import-data.js --import
if(process.argv[2] === '--import'){
    importUsers();
}
// To delete all the data in the user.js file run the comman  as:- node data/import-data.js --delete
if(process.argv[2] === '--delete'){
    deleteUsers();
}