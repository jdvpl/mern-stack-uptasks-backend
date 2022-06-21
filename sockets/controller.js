

const socketController=(socket) =>{
  console.log("conectado a socket.io"+socket.id);

  socket.on("test",(t)=>{
    console.log(t)

    socket.emit('response',{name:'kakaroto'})
  })

}

module.exports={
  socketController
}