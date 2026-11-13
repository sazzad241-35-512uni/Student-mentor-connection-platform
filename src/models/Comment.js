const mongoose = require('mongoose');
const schema = new mongoose.Schema({ post:{type:mongoose.Schema.Types.ObjectId,ref:'Post',required:true,index:true}, author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, text:{type:String,required:true,trim:true,maxlength:1000} },{timestamps:true});
module.exports = mongoose.model('Comment',schema);
