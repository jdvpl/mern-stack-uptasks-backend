const { response } = require("express");
const User=require("../models/user");
const bcryptjs=require("bcryptjs");
const { generarJWT } = require("../helpers/generate-jwt");


const login=async(req,res=response)=>{
  const {email,password}=req.body;

  try {
    // verificar si el correo existe
    const user=await User.findOne({ email});
    if(!user){
      return res.status(404).json({msg: 'Usuario no existe'})
    }
    // verificar si el usaurio esta activo
    if(!user.status){
      return res.status(400).json({msg: 'Este usuario no esta activo'})
    }
    // verificar la contraseña
    const validPassword=bcryptjs.compareSync(password, user.password);

    if(!validPassword){
      return res.status(400).json({
        msg: 'Contraseña erronea'
      })
    }
    // generar el JWT
    const token=await generarJWT(user.id);
    res.json({user,token})
  } catch (error) {
    console.log(error)
    res.status(500).json({msg: 'Hubo un error al loguearse'})
  }
  
}



module.exports = {login};