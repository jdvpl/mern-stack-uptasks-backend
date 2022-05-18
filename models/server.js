const express = require('express');
const cors = require('cors');
class Server{
  constructor(){
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.paths={
      auth:'/api/auth',
    }

    // middleware: son funcionalidads para el webserver
    this.middlewares();
    // rutas de mi app
    this.routes();
  }


  routes() {
    this.app.use(this.paths.auth, require('../routes/auth.routes'))

  }
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Corriendo http://localhost:${this.port}`)
    });
  }

  middlewares() {
    // usar cors
    this.app.use(cors());

    // parseo de la info del body
    this.app.use(express.json())


  }
}

module.exports = Server;