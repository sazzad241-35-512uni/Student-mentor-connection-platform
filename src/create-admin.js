// Run once from the project root: npm run create-admin -- --name "Admin" --email admin@example.com
// Set ADMIN_PASSWORD in your environment before running this command.
require('dotenv').config();
const mongoose=require('mongoose');const bcrypt=require('bcryptjs');const User=require('./models/User');
function arg(name){const i=process.argv.indexOf(`--${name}`);return i>=0?process.argv[i+1]:''}
(async()=>{const name=arg('name'),email=arg('email')?.toLowerCase(),password=process.env.ADMIN_PASSWORD;if(!process.env.MONGODB_URI||!name||!email||!password||password.length<12){console.error('Required: MONGODB_URI, ADMIN_PASSWORD (12+ chars), --name "Admin Name", --email admin@example.com');process.exit(1)}try{await mongoose.connect(process.env.MONGODB_URI);const exists=await User.findOne({email});if(exists){console.error('That email is already registered.');process.exitCode=1}else{await User.create({name,email,passwordHash:await bcrypt.hash(password,12),role:'admin',field:'Platform Administration'});console.log(`Administrator created: ${email}`)}}catch(e){console.error(e.message);process.exitCode=1}finally{await mongoose.disconnect()}})();
