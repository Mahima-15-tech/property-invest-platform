const mongoose = require("mongoose");

const exitSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    investmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Investment",
        required:true
    },

    propertyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Property",
        required:true
    },

    shares:{
        type:Number,
        required:true
    },

    amount:{
        type:Number,
        required:true
    },

    status:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },

    remarks:String,

    approvedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
    approvedAt:Date

},
{timestamps:true}
);

module.exports=mongoose.model("Exit",exitSchema);