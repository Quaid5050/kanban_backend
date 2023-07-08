const mongoose=require("mongoose");

console.log("Connecting")


const DB=process.env.DATABASE;

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true

}).then(()=>{
    console.log("Successfully connection esatablished")
}).catch((Err)=>{
    console.log("Error is "+Err)
})
