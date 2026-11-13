const mongoose = require('mongoose');
const schema = new mongoose.Schema({ user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true}, actor:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, type:{type:String,required:true}, text:{type:String,required:true,maxlength:300}, link:{type:String,default:''}, readAt:{type:Date,default:null} },{timestamps:true});
module.exports = mongoose.model('Notification',schema);
