const { response } = require("express");
const { addingCollaborator } = require("../helpers/email");
const Project=require("../models/projects");
const User = require("../models/user");



// obtener todas la categorias- paginacion-total y populate(relacion de quien la creo)
const getProjects=async(req, res=response) => {
  const {limite=20, desde=0}=req.query;
  const estado={status:true}
  const [total,projects]=await Promise.all([
    Project.countDocuments({
      $or: [
        {'collaborators':{$in:req.user}},
        {'creator':{$in:req.user}},
      ],
      $and:[
        estado
      ]
    }),
    Project.find({
      '$or': [
        {'collaborators':{$in:req.user}},
        {'creator':{$in:req.user}},
      ],
      '$and':[
        estado
      ]
    })
      .populate('creator',['name','email'])
      .select('-tasks')
      .skip(Number(desde))
      .limit(Number(limite))
  ])
  res.json({total,limite,desde, projects});
}
// obtener todas la categoria por id paginacion-total y populate(relacion de quien la creo)
const getProjectById=async(req, res=response) => {
  const {id}=req.params;
  try {
    const project=await Project.findById(id).populate('creator',["name",'email']).populate('collaborators',['name',"email"]).populate({
      path:'tasks',
      match: {status:true},
      options:{sort: {finished:1,dateDelivery:1},
    }
    }
      );
    if(!project) {
      return res.status(403).json({msg: `Not Found`});
    }
    if(project.creator._id.toString() !== req.user._id.toString() && !project.collaborators.some(collaborator=>collaborator._id.toString()===req.user._id.toString())){
      return res.status(401).json({msg:"This user can't access to this project."})
    }
    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({msg: error.message});
  }
}


// crear Producto
const createProject = async(req,res=response)=>{
  const {status,user,...body}=req.body;
  const {client,description,dateDelivery}=body;
  const name = req.body.name.toUpperCase();
  // generar la data al guardar
  const data={
    name,
    creator: req.user._id,
    description,
    client,
    dateDelivery
  }
  try {
    const project=new Project(data);
    await project.save();
    return  res.status(200).json({project,msg:"Project created successfully"});
  } catch (error) {
    return res.status(500).json({msg: error.message});
  }
}
// actualizar categoria
const updateProject=async(req, res=response) => {
  const {id}=req.params;
  const {status,user,...data}=req.body;

  if(data.name){
    data.name=data.name.toUpperCase();
  }
  data.user=req.user._id;
  const proyecto=await Project.findById(id);

  const idProyectoCreator=proyecto.creator.toString();
  const idUsuario=req.user._id.toString();

  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  } 

  try {
    const project=await Project.findByIdAndUpdate(id,data, {new: true}).populate('creator',['name']);
    return res.status(200).json({ project,msg:'Project updated successfully'});
  } catch (error) {
    return res.status(500).json({msg: error.message});
  }
}

const deleteProject = async(req, res=response) => {
  const {id}=req.params;

  const proyecto=await Project.findById(id);

  const idProyectoCreator=proyecto.creator.toString();
  const idUsuario=req.user._id.toString();

  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  }
  try {
    const productoborrado=await Project.findByIdAndUpdate(id, {status: false}, {new:true}).populate('creator',['name']);
    return res.status(200).json({msg: `Project deleted successfully.`,productoborrado});
  } catch (error) {
    return res.status(500).json({msg: error.message});
  }
}

const searchCollaborators=async(req, res) => {
  const {email}=req.body;
  try {
    const user=await User.findOne({email}).select('-token -role -createdAt -updatedAt -status');
    return res.json(user)
  } catch (error) {
    return res.status(500).json({msg: error.message});
  }
}

const addCollaborators=async(req, res) => {
  const idProject=req.params.id;
  const project=await Project.findById(idProject).populate('creator',["_id","name"]);
  if(project.creator._id.toString() !==req.user._id.toString()) {
    return res.status(404).json({msg:"You can't add users, you are not the owner of this project."})
  }
  const {email} = req.body;
  const user=await User.findOne({email})
  if(project.creator._id.toString() ===user._id.toString()) {
    return res.status(404).json({msg:"You can't add yourself."})
  }
  if(project.collaborators.includes(user._id)){
    return res.status(404).json({msg:"This user is already a collaborator."})
  }
  const dataEmail={
    email,
    projectName:project.name,
    messageSubject:'Eres colaborador del proyecto',
    messageText:'Te han agregado como colaborador',
    messageHtml:`Hola el administrador <b>${project.creator.name} </b>del proyecto <b>${project.name}</b> te ha agregado al proyecto para que puedas collaborar en el.`
  }

  // agregar user
  project.collaborators.push(user._id);
  await project.save()

  addingCollaborator(dataEmail)
  return res.json({msg:"User added successfully.",project});
}

// delete project

const deleteCollaborator=async(req, res) => {
  const idProject=req.params.id;
  const {email,_id,name} = req.body;

  const project=await Project.findById(idProject).populate('creator',["_id","name"]);
  if(project.creator._id.toString() !==req.user._id.toString()) {
    return res.status(404).json({msg:"You can't add users, you are not the owner of this project."})
  }

  const dataEmail={
    email,
    projectName:project.name,
    messageSubject:'Ya no eres colaborador del proyecto',
    messageText:'Te han eliminado del proyecto',
    messageHtml:`Hola ${name} el administrador <b>${project.creator.name} </b>del proyecto <b>${project.name}</b> te ha eliminado del proyecto, gracias por haber estado en el proyecto.`
  }

  // agregar user
  project.collaborators.pull(_id);
  addingCollaborator(dataEmail)
  await project.save()

  return res.json({msg:"User deleted successfully.",collaborator:_id});
}


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addCollaborators,
  deleteCollaborator,
  searchCollaborators
}