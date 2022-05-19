const {Schema,model}=require('mongoose')

const TaskSchema=Schema({
  name:{
    type:String,
    required:[true,"El nombre es obligatorio"],
    trim:true
  },
  description:{
    type: String,
    required:true,
  },
  status:{
    type:Boolean,
    default:true,
  },
  finished:{
    type:Boolean,
    default:false,
  },
  dateDelivery:{
    type:Date,
    default:Date.now(),
    required:true,
  },
  priority:{
    type: String,
    required:true,
    enum:['Baja','Media','Alta']
  },
  project:{
    type: Schema.Types.ObjectId,
    ref: 'Project'
    },
},{
  timestamps:true,
});

TaskSchema.methods.toJSON=function(){
  const {__v,_id,...task}=this.toObject();
  task.uid=_id;
  return task
}

module.exports =model('Task',TaskSchema)