const { response } = require("express")
const Project=require("../models/projects")



// obtener todas la categorias- paginacion-total y populate(relacion de quien la creo)
const getProjects=async(req, res=response) => {
  const {limite=10, desde=0}=req.query;
  const estado={status:true}
  const [total,projects]=await Promise.all([
    Project.countDocuments(estado)
    .where('creator').equals(req.user),
    Project.find(estado)
      .populate('creator',['name'])
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
    const project=await Project.findById(id).populate('creator',["name"]).populate('collaborators',['name']).where('creator').equals(req.user);

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
  const {client,description}=body;
  const name = req.body.name.toUpperCase();

  // generar la data al guardar
  const data={
    name,
    creator: req.user._id,
    description,
    client
  }
  try {
    const project=new Project(data);
    await project.save();
    return  res.status(200).json(project);
  } catch (error) {
    return res.status(500).json(error)
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
    const producto=await Project.findByIdAndUpdate(id,data, {new: true}).populate('creator',['name']);
    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json(error)
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
    return res.status(200).json({msg: `Proyecto eliminado.`,productoborrado});
  } catch (error) {
    return res.status(500).json(error)
  }
}

const addCollaborators=(req, res) => {

}

const deleteCollaborator=(req, res) => {

}

const getTasks=(req, res) => {

}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addCollaborators,
  deleteCollaborator,
  getTasks
}