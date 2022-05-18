const express = require('express');
const cors = require('cors');
const { dbConection } = require('../database/database');

class Server{
  constructor(){
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.paths={
      users:'/api/users',
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
    // usar cors
    this.app.use(cors());

    // parseo de la info del body
    this.app.use(express.json())


  }
}

module.exports = Server;