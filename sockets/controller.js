

const socketController=(socket) =>{
  console.log("Connected to socket.io id: "+socket.id);

  socket.on('open project',(project) =>{
    socket.join(project)
  })

  socket.on('new task',(task) =>{
    const project = task.project;
    console.log(project)
    socket.to(project).emit('task added',task)
  })


}

module.exports={
  socketController
}