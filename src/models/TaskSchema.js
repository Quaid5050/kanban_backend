const mongoose = require("mongoose");

const taskSchema=new mongoose.Schema({

title:{
    type: String,
    required:true,
},
description:{
    type:String,
    required:true
},
deadline:{
    type:Date,
    required:true
},
priority:{
    type:String,
    required:true
},
dependency:{
    type:String,
},
assigned:{
    type:String,
    required:true
},
cardid:{
    type:String,
    required:true
}
})

const task = mongoose.model("task", taskSchema);

module.exports=task;
