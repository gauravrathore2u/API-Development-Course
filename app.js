const AppError = require('./utils/appError.js');
const express = require('express');

const app = express();

//Serving template demo
app.use(express.static(__dirname + "/data/img"));


//middleware

app.use((req, resp, next)=>{
    console.log('I am middleware');
    next();
})
app.use((req, resp, next)=>{
    req.timeForApi = new Date()
    next();
})


const userRouter = require('./routes/userRoutes');
const productsRouter = require('./routes/productsRoutes');

app.use(express.json());
app.use('/api/v1/user', userRouter);
app.use('/api/v1/products', productsRouter);


//error handling if the base url is not matched in any of the above route url.
app.all("*", (req, resp, next)=>{
    // resp.status(404).json({
    //     status: "failed",
    //     message: `the url ${req.url} does not exist`
    // })

    next(new AppError(`the url ${req.url} does not exist`, 404))
})


//Error Middleware--- Global Error Handler
// app.use((err, req, resp, next)=>{
//     console.log(err.stack);
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'failed';
//     resp.status(err.statusCode).json({
//         status: err.status,
//         message: err.message
//     })
//     next();
// })

module.exports = app;