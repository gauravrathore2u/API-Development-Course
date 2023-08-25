const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "Id is required for a user"],
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,             //trim will remove the extra space from start and end
        maxlength: [20,  "Name should be less than 20 characters"],
        minlength: [5, "Name should be greater than 5 characters"],
        // validate: [validator.isAlpha, "Only alphabets are allowed"]
    },
    age: {
        type: Number,
        min: [18, "Minimun age should be 18 years"]
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female"],
            message: "gender can only be from male or female"
        }
    },
    email:{
        type: String,
        lowercase: true,     //it will turn the capital into small
        required: [true, "please provide email for signup"],
        validate: [validator.isEmail, "Please provide a valid email address"]
        
        // // THIS WILL ONLY WORK WHEN CREATING NOT UPDATING 
        // validate: {
        //     validator: function(value){
        //         if(value.indexOf("@") == -1){
        //             return false;
        //         }else{
        //             return true;
        //         }
        //     },
        //     message: "Please check the email address ({VALUE})"
        // }
    },
    password: {
        type: String,
        required: [true, "password is required"],
        select: false
    },
    phone:{
        type: String,
        maxlength: [10, "Please check the Mobile no."],
        validate: [validator.isNumeric, "Only numbers are allowed"]
    },
    address:{
        type: String
    },
    isActive:{
        type: Boolean,
        default: true            //to set default if not given
    },
    balance:{
        type: Number
    },
    eyeColor: {
        type: String
    },
    company: {
        type: String
    },
    about: {
        type: String,
        select: false               //data will save to DB but will not be shown to user
    },
    registered: {
        type: Date
    },
    tags: {
        type: Array
    },
    favoriteFruit: {
        type: String
    }


}, { 
    toJSON: { virtuals: true},
    toObject: {virtuals: true}
});


//virtual propety is used to show the field in response but this field is not saved in the DB. It will only show in response. 
//we can use this virtual property to show some fields having some calculaton on the basis of other fields. eg. 
// userSchema.virtual("pinCode").get(function(){
//     let contactNo = this.phone;               //we are not using arrow function so that we can use "this" key word
//     let pin = contactNo.substring(contactNo.indexOf("(")+1, contactNo.indexOf(")"));
//     return pin;
// })


//encryption of password before saving to db
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
         return next();
    }

    this.password = await bcrypt.hash(this.password, 10)   //here higher the number better the encription but it will take too much time to encrypt
    next();
})


//comparing the password given by user while login and encrypted password saved in db
userSchema.methods.checkPassword = async function (typedPassword, userPassword){
    return await bcrypt.compare(typedPassword, userPassword);
}

const userModel = mongoose.model('datas', userSchema);


module.exports = userModel;