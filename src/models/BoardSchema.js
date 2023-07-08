const mongoose = require("mongoose");

const BoardSchema=new mongoose.Schema({

title:{
    type: String,
},

projectid:{
    type:String,
    required:true,
}
,
projectCreation:{
    type:Date,
    required:true
}

})

const Board = mongoose.model("Board", BoardSchema);

module.exports=Board;
