const {Schema,model}= require('mongoose');
const bcrypt=require('bcryptjs')

const UsuarioSchema=Schema({
  name:{
    type:String,
    required:[true,'El nombre es obligatorio'],
    trim:true
  },
  email:{
    type:String,
    required:[true,'El correo es obligatorio'],
    unique:[true,'Email ya registrado']
  },
  password:{
    type:String,
    required:[true,'El contraseña es obligatoria'],
    trim:true
  },
  token:{
    type:String,
  },
  role:{
    type:String,
    default:'USER_ROLE',
    required:[true,'El rol es obligatorio'],
    // enum:['ADMIN_ROLE','USER_ROLE']
  },
  status:{
    type:Boolean,
    default:false
  },

},{
  timestamps:true,
})

UsuarioSchema.pre('save',async function(next) {
  if(!this.isModified('password')){
    next();
  }
  const salt= await bcrypt.genSalt(10);
  this.password=await bcrypt.hash(this.password,salt);
})


UsuarioSchema.methods.toJSON=function(){
  const {__v,password,_id,...user}=this.toObject();
  user.uid=_id;
  return user
}

module.exports=model('User',UsuarioSchema);