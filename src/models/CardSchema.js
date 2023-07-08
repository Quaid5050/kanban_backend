const mongoose = require("mongoose");

const cardSchema=new mongoose.Schema({

title:{
    type: String,
    required:true,
},
boardid:{
    type:String,
    required:true
}
})

const Card = mongoose.model("card", cardSchema);

module.exports=Card;
