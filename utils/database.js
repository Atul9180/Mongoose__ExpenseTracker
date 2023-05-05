const mongoose= require("mongoose");


const connectDB= async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });
        console.log(`Server connect to mongoose Db`);
    }
    catch(error){
        console.log(error)
    }
}

module.exports =connectDB;
