const { response } = require("express");
const { addingCollaborator } = require("../helpers/email");
const Project=require("../models/projects");
const User = require("../models/user");



// obtener todas la categorias- paginacion-total y populate(relacion de quien la creo)
const getProjects=async(req, res=response) => {
  const {limite=20, desde=0}=req.query;
  const estado={status:true}
  const [total,projects]=await Promise.all([
    Project.countDocuments(estado)
    .where('creator').equals(req.user),
    Project.find(estado)
      .populate('creator',['name'])
      .select('-tasks')
      .skip(Number(desde))
      .limit(Number(limite))
      .where('creator').equals(req.user)
  ])
  res.json({total,limite,desde, projects});
}
// obtener todas la categoria por id paginacion-total y populate(relacion de quien la creo)
const getProjectById=async(req, res=response) => {
  const {id}=req.params;
  try {
    const project=await Project.findById(id).populate('creator',["name"]).populate('collaborators',['name',"email"]).populate({
      path:'tasks',
      match: {status:true},
      options:{sort: {finished:1,dateDelivery:1},
    }
    }
      )
      .where('creator').equals(req.user);

    if(!project) {
      return res.status(403).json({msg: `Este usuario no tiene permiso para ver este proyecto.`});
    }
    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json(error)
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
    email,projectName:project.name,adminName:project.creator.name
  }

  // agregar user
  project.collaborators.push(user._id);
  await project.save()

  addingCollaborator(dataEmail)
  return res.json({msg:"User added successfully.",project});
}

const deleteCollaborator=(req, res) => {

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