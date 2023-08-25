const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

const DB = process.env.MONGODB_URL.replace("<PASSWORD>", process.env.MONGODB_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true
}).then((con)=>{
    // console.log(con.connection);
    console.log("db is successfully connected");
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`App is running on ${PORT}.....`);
}) 