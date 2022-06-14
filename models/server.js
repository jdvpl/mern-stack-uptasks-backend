const express = require('express');
const cors = require('cors');
const { dbConection } = require('../database/database');

class Server{
  constructor(){
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.paths={
      users:'/api/users',
      auth:'/api/auth',
      projects:'/api/projects',
      tasks:'/api/tasks',
    }

    // conectar a la base de datos
    this.conectarDb()

    // middleware: son funcionalidads para el webserver
    this.middlewares();
    // rutas de mi app
    this.routes();
  }


  routes() {
    this.app.use(this.paths.users, require('../routes/users.routes'))
    this.app.use(this.paths.auth, require('../routes/auth.routes'))
    this.app.use(this.paths.projects, require('../routes/project.routes'))
    this.app.use(this.paths.tasks, require('../routes/tasks.routes'))

  }
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Corriendo http://localhost:${this.port}`)
    });
  }

  async conectarDb(){
    await dbConection()
  }

  middlewares() {
    const urls=process.env.URLS_WHITE_LIST.split(',')
    const whiteList=urls;
    const corsOptions = {
      origin:function(origin,callback){
        if(whiteList.includes(origin)){
          callback(null,true);
        }else{
          callback(new Error(`No esta permitido para esta url. ${origin}`));
        }
      }
    }
    // usar cors
    if(process.env.ENV_PRODUCTION=="production"){
      this.app.use(cors(corsOptions));
    }else{
      this.app.use(cors());
    }

    // parseo de la info del body
    this.app.use(express.json())


  }
}

module.exports = Server;