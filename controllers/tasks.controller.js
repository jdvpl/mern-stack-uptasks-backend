const { response } = require("express");
const Project = require("../models/projects");
const Task=require("../models/tasks")


// obtener todas la categoria por id paginacion-total y populate(relacion de quien la creo)
const getTask=async(req, res=response) => {
  const {id}=req.params;
  try {
    const project=await Task.findById(id).populate('project',["name"]).populate('collaborators',['name']).where('creator').equals(req.user);

    if(!project) {
      return res.status(403).json({msg: `Este usuario no tiene permiso para ver este proyecto.`});
    }
    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json(error)
  }
}


// crear tarea
const createTask = async(req,res=response)=>{
  const {status,user,...body}=req.body;
  const { project,description,priority}=body;
  const name = req.body.name.toUpperCase();

  // generar la data al guardar
  const data={
    name,
    description,
    priority,
    project
  }
  const proyecto=await Project.findById(project);

  const idProyectoCreator=proyecto.creator.toString();
  const idUsuario=req.user._id.toString();

  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  } 
  try {
    const project=new Task(data);
    await project.save();
    return  res.status(200).json(project);
  } catch (error) {
    return res.status(500).json(error)
  }
}
// actualizar categoria
const updateTask=async(req, res=response) => {
  const {id}=req.params;
  const {status,user,...data}=req.body;

  if(data.name){
    data.name=data.name.toUpperCase();
  }
  data.user=req.user._id;
  const proyecto=await Task.findById(id);

  const idProyectoCreator=proyecto.creator.toString();
  const idUsuario=req.user._id.toString();

  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  } 

  try {
    const producto=await Task.findByIdAndUpdate(id,data, {new: true}).populate('creator',['name']);
    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json(error)
  }
}

const deleteTask = async(req, res=response) => {
  const {id}=req.params;

  const tarea=await Task.findById(id);

  const idProyectoCreator=tarea.creator.toString();
  const idUsuario=req.user._id.toString();

  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  }
  try {
    const tareaBorrada=await Task.findByIdAndUpdate(id, {status: false}, {new:true}).populate('creator',['name']);
    return res.status(200).json({msg: `Tarea eliminada.`, tareaBorrada});
  } catch (error) {
    return res.status(500).json(error)
  }
}



const changeStatus=(req, res) => {

}

module.exports = {
  getTask,
  createTask,
  updateTask,
  deleteTask,
  changeStatus
}