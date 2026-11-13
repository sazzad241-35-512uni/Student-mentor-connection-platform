const mongoose = require('mongoose');
const schema = new mongoose.Schema({ reporter:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, targetType:{type:String,enum:['post','user','resource','research','comment'],required:true}, targetId:{type:mongoose.Schema.Types.ObjectId,required:true}, reason:{type:String,required:true,trim:true,maxlength:600}, status:{type:String,enum:['open','resolved','dismissed'],default:'open'}, resolvedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, resolvedAt:Date },{timestamps:true});
module.exports = mongoose.model('Report',schema);
