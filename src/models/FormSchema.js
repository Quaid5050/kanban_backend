const mongoose = require("mongoose");

const FormSchema=new mongoose.Schema({

   title:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
    },
    teamMembers:{
        type:Array,
        required:true,
    },
    created_at    :
     { type: Date, required: true, default: Date.now }
})

const Form = mongoose.model("ProjectForm", FormSchema);

module.exports=Form;
