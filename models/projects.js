const {Schema,model}=require('mongoose')

const ProjectSchema=Schema({
  name:{
    type:String,
    required:[true,"El nombre es obligatorio"],
    trim:true,
  },
  description:{
    type:String,
    required:[true,"La descripcion es obligatoria"],
    trim:true,
  },
  dateDelivery:{
    type:Date,
    default:Date.now(),
  },
  client:{
    type:String,
    required:[true,"El cliente es obligatorio"],
    trim:true,
  },
  creator:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required:true,
  },
  collaborators:[
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  status:{
    type: Boolean,
    default:true,
  },

},
  {
    timestamps:true,
  }
);

ProjectSchema.methods.toJSON=function(){
  const {__v,status,_id,...produto}=this.toObject();
  produto.uid=_id;
  return produto
}

module.exports =model('Project',ProjectSchema)