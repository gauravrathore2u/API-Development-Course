// const fs = require('fs');

// const userData = JSON.parse(fs.readFileSync(__dirname+'/../data/user.json'));

// //middleware for checking id
// exports.checkId = (req, resp, next, value) =>{   //value is optional we can use req.params.id also
//     console.log("value",value);
//     // console.log("req param", req.params);
//     const id = value * 1    //multilplying it by 1 will convert string to number
//     if(id >= userData.length){
//         return resp.status(404).json({   //return is important otherwise below code will also run
//             status: 'failed',
//             message: 'Invalid id'
//         })
//     }
//     next();
// }

// //middleware for cheking body
// exports.checkBody = (req, resp, next) =>{
//     console.log('checkbody middleware');
//     if(!req.params.name || !req.params.gender){
//         return resp.status(400).json({
//             status: 'failed',
//             message: "missing Name and gender"
//         })
//     }
//     next();
// }

// //get method
// exports.getUser = (req, resp)=>{
//     console.log(req.timeForApi);
//     resp.status(200).json({
//         status: "success",
//         time: req.timeForApi,
//         results: userData.length,
//         data: userData
//     })
// }

// //post method
// exports.createUser = (req,resp)=>{
//     const newId = userData[userData.length - 1].id + 1;
//     console.log(newId);
//     const newUser = Object.assign({id: newId}, req.body);
//     console.log(newUser);
//     userData.push(newUser);
//     fs.writeFile(`${__dirname}/data/user.json`, JSON.stringify(userData), (err)=>{
//         resp.send({
//             status: 'success',
//             user: newUser
//         })
//     })
// }

// //get single user method
// exports.singleUser = (req, resp)=>{
//     const id = req.params.id * 1    //multilplying it by 1 will convert string to number

//     const user = userData.find((user)=> user.id === id);
//     resp.status(200).json({
//         status:'success',
//         data: {
//             user: user
//         }
//     })
// }

// //udating user using patch method
// exports.updateUser = (req, resp)=>{

//     resp.status(200).json({
//         status:'success',
//         message: "data updated successfully"
//     })
// }

// //deleting user
// exports.deleteUser  = (req, resp)=>{

//     resp.status(204).json({
//         status:'success',
//         data: null
//     })
// }

//----------------------------------------------------------------------------------------------
//controller using real database MongoDB
const userModel = require("../model/userModel");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signInToken = (id)=>{
    return jwt.sign({id: id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    })
}

//sign up 
exports.userSignUp = async (req, resp)=>{
  try {
    const newUser = await userModel.create(req.body);

    const token = signInToken(newUser._doc._id.toString())

    resp.status(201).json({
      status: "success",
      message: "Signed up successfully",
      token,
      data: {
        user: newUser._doc
      }
    })
  } catch (error) {
    resp.status(400).json({
      status: "failed",
      message: error,
    });
  }
}

//login 
exports.userLogin = async (req, resp)=>{
  try {
    if(!req.body.email || !req.body.password){
      throw new Error("Please provide Email and Password");
    }

    const user = await userModel.findOne({email: req.body.email}).select("+password");
    const passwordCheck = await bcrypt.compare(req.body.password, user._doc.password);

    if(!user ||  !passwordCheck){      //we do not want to give hint to hacker which is wrong email or password
      throw new Error ("Email or Password is wrong");
    }

    const token = signInToken(user._doc._id.toString());

    let decodedToken = jwt.verify(req.headers.authtoken, process.env.JWT_SECRET)
    console.log(decodedToken);

    if(!decodedToken){
      throw new Error("auth token is missing from headers!!")
    }

    resp.status(200).json({
      status: "sucess",
      token
    })

  } catch (error) {
    resp.status(400).json({
      status: "failed",
      message: error.message
    });
  }
 
}



//get method
exports.getUser = async (req, resp) => {
  try {
        //Filtering 

    //If we want to exclude some filds which should not be present in query even if user typed in url
    const queryObj = {...req.query};
    const excludedFields = ['email', 'phone', 'sort', 'fields', 'page', 'limit'];   //if we pass sort from query then we have to remove it
    excludedFields.forEach(element => 
        delete queryObj[element]
    );

    //making functionlity to let search the user for less than, greater than, etc. values through query params
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let newQueryObj = JSON.parse(queryStr);



    let query = userModel.find(newQueryObj); //if someone passed the query to find user
   
        //Sorting 

    if(req.query.sort){
        let sortBy = req.query.sort.split(',').join(" ");   //if two or more sorting params given using ',' eg. http://localhost:3000/api/v1/user?sort=age,name
        query.sort(sortBy);
    }
    else{
        query.sort('id');
    }  

    
    // Field limiting 
    if(req.query.fields){
        const fields = req.query.fields.split(',').join(" ");
        query.select(fields);
    }
    else{
        query.select("-__v");
    }


    //Pagination i.e. showing data in chunks eg. page=2 (at page 2) and limit=10 (limit is how many data to show in sigle page)
    if(req.query.page || req.query.limit){
        const page = req.query.page;
        const limit = req.query.limit;    //how many documents have to show
        const skip = (page - 1) * limit;  //how many documents have to skip
        const noOfDoc = await userModel.countDocuments();  //no. of documents in collection
        if(skip >= noOfDoc){
            throw new Error("This page does not exist");
        }
        
        query = query.skip(skip).limit(limit);
    }


    const data = await query;
    resp.status(200).json({
      status: "success",
      totalUser: data.length,
      data: data,
    });
  } catch (error) {
    resp.status(500).json({
      status: "failed",
      message: "server Error",
    });
  }
};

//post method
exports.createUser = async (req, resp) => {
  try {
    //1. Method one
    // const dataToSave = new userModel(req.body);
    // const saved = await dataToSave.save();

    //2. Method two
    const dataToSave = await userModel.create(req.body);

    resp.status(201).json({
      status: "success",
      data: dataToSave._doc,
    });
  } catch (err) {
    resp.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

//get single user method
exports.singleUser = async (req, resp) => {
  try {
    const user = await userModel.findOne({ userId: req.params.id });
    resp.status(200).json({
      status: "success",
      data: {
        user: user,
      },
    });
  } catch (error) {
    resp.status(400).json({
      status: "failed",
      message: error,
    });
  }
};

//udating user using patch method
exports.updateUser = async (req, resp) => {
  try {
    const updateData = await userModel.updateOne(
      { userId: req.params.id },
      { $set: req.body }
    );

    resp.status(200).json({
      status: "success",
      data: updateData,
    });
  } catch (error) {
    resp.status(400).json({
      status: "failed",
      message: error,
    });
  }
};

//deleting user
exports.deleteUser = async (req, resp) => {
  try {
    await userModel.deleteOne({ userId: req.params.id });
    resp.status(204).json({
      //In 204 we donot get any response back 204 means no content
      status: "success",
      data: null,
    });
  } catch (error) {
    resp.status(404).json({
      status: "failed",
      error: error,
    });
  }
};



//aggregation pipeline
exports.userStats = async  (req, resp)=>{
    try {
        const stats = await userModel.aggregate([
            {
                $match:{age:{$gte: 18}}
            },
            {
                $group: {
                    _id: "$gender",
                    avgAge: {$avg: "$age"},
                    minAge: {$min: "$age"},
                    avgBalance: {$avg: "$balance"},
                    total: {$sum: 1}

                }
            },
            {
                $sort:{total:1}
            },
            {
                $addFields: {
                    groupBy: "$_id"
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        resp.status(200).json({
            status: 'success',
            data: stats
        })
    } catch (error) {
        resp.status(404).json({
            status: "failed",
            error: error,
          });
    }
}
