const Role=require('../models/rol');
const Usuario= require('../models/user');



const esRoleValido= async(rol='') =>{
  const existeRole=await Role.findOne({ rol});
  if(!existeRole){
    throw new Error(`El rol ${rol} no existe en la BD`)
  }
}

const existeCorreo=async(email='')=>{
    // verificar si el correo existe
    const existsEmail=await Usuario.findOne({email});
    if (existsEmail){
      throw new Error(`El Correo ${email} ya existe`);
    }
}
const noExisteCorreo=async(email='')=>{
    // verificar si el correo existe
    const noExistsEmail=await Usuario.findOne({email});
    if (!noExistsEmail){
      throw new Error(`El Correo ${email} no existe`);
    }
}
const existeID=async(id='')=>{
    // verificar si el correo existe
    const existsID=await Usuario.findById(id);
    if (!existsID){
      throw new Error(`El usuario con id ${id} no existe`);
    }
    return true;
}


// validar colecciones permitidas
const coleecionesPermitidas =(coleccion='',colecciones=[])=>{
  const includes=colecciones.includes(coleccion);

  if(!includes){
    throw new Error(`La coleccion ${coleccion} no es permitida. ${colecciones}` )
  }

  return true;
}
module.exports ={
  esRoleValido,
  existeCorreo,
  existeID,
  coleecionesPermitidas,
  noExisteCorreo
}