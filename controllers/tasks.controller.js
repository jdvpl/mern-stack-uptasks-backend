const { response } = require("express");
const { sendEmailTask } = require("../helpers/email");
const Project = require("../models/projects");
const Task=require("../models/tasks")


// obtener todas la categoria por id paginacion-total y populate(relacion de quien la creo)
const getTask=async(req, res=response) => {
  const {id}=req.params;
  try {
    const project=await Task.findById(id).populate('project',["name","creator"]).where('creator').equals(req.user);

    if(!project) {
      return res.status(403).json({msg: `Este usuario no tiene permiso para ver este proyecto.`});
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({msg:error.message});
  }
}


// crear tarea
const createTask = async(req,res=response)=>{
  const {status,user,...body}=req.body;
  const { project,description,priority,dateDelivery}=body;
  const name = req.body.name.toUpperCase();

  // generar la data al guardar
  const data={
    name,
    description,
    priority,
    project,
    dateDelivery
  }
  const proyecto=await Project.findById(project);

  const idProyectoCreator=proyecto.creator.toString();
  const idUsuario=req.user._id.toString();

  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  } 
  try {
    const task=new Task(data);
    await task.save();
    proyecto.tasks.push(task._id);
    proyecto.save();
    return  res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({msg:error.message});
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
  const tarea=await Task.findById(id).populate('project',['creator']);
  const idProyectoCreator=tarea.project.creator.toString();
  const idUsuario=req.user._id.toString();
  console.log(idUsuario)
  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  } 

  try {
    const task=await Task.findByIdAndUpdate(id,data, {new: true}).populate('project',['name']);
    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({msg:error.message})
  }
}

const deleteTask = async(req, res=response) => {
  const {id}=req.params;

  const tarea=await Task.findById(id).populate('project',['creator']);

  const idProyectoCreator=tarea.project.creator.toString();
  const idUsuario=req.user._id.toString();

  if(idProyectoCreator !== idUsuario){
    return res.status(403).json({msg: `No eres el creador de este proyecto.`})
  }
  try {
    const tareaBorrada=await Task.findByIdAndUpdate(id, {status: false}, {new:true}).populate('project',['name']);
    return res.status(200).json({msg: `Task deleted successfully.`, tareaBorrada});
  } catch (error) {
    return res.status(500).json({msg:error.message});
  }
}
const changeStatus=async(req, res) => {
  const {id}=req.params;
  const task=await Task.findById(id).populate(
    {
      path:'project',
      populate:{
        path:'creator'
      }
    }
    );
  
  const idProyectoCreator=task.project.creator._id.toString();
  const idUsuario=req.user._id.toString();
  if(idProyectoCreator !== idUsuario && !task.project.collaborators.some(collaborator=>collaborator._id.toString()===req.user._id.toString())){
    return res.status(403).json({msg: `You can't access to this project`})
  }
  try {
    task.finished=!task.finished;
    task.finishedBy=req.user._id;

    const dataEmail={
      email:req.user.email,
      messageSubject:task.finished?`Termino la tarea ${task.name}`:`Desmarco la tarea ${task.name}`,
      messageText:task.finished?`Terminaste la tarea ${task.name}`:`No has completado la tarea ${task.name}`,
      messageHtml:`Gracias por participar en la tarea ${task.name}`
    }

    sendEmailTask(dataEmail)
    if(idProyectoCreator !== idUsuario){
      const dataEmailAdmin={
        email:task.project.creator.email,
        messageSubject:``+task.finished?`Termino la tarea ${task.name}`:`Desmarco la tarea ${task.name}`,
        messageText:task.finished?`Finalizaste la tarea ${task.name}`:`No has completado la tarea ${task.name}`,
        messageHtml:`El usuario ${req.user.name} ha ${task.finished?'Finalizado':'desmarcado'} la tarea ${task.name}`
      }
      sendEmailTask(dataEmailAdmin)
    }
  
    // agregar user
    await task.save()
    const taskUpdated=await Task.findById(id).populate('project').populate('finishedBy')
    return res.status(200).json({msg: `Task updated successfully.`, task:taskUpdated});
  } catch (error) {
    return res.status(500).json({msg:error.message});
  }
}

module.exports = {
  getTask,
  createTask,
  updateTask,
  deleteTask,
  changeStatus
}