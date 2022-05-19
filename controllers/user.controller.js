const {response}=require('express');
const { generateToken } = require('../helpers/generateToken');
const User= require('../models/user');

const getUsersConfirmed=async(req, res=response) => {

  const estado={status:true}
  const {limite=5, desde=0}=req.query;


  const [total,usuarios]=await Promise.all([
    User.countDocuments(estado),
    User.find(estado)
      .skip(Number(desde))
      .limit(Number(limite))
  ])
  res.json({total,limite,desde,usuarios});
}
const usersNoConfirmed=async(req, res=response) => {

  const estado={status:false}
  const {limite=5, desde=0}=req.query;


  const [total,usuarios]=await Promise.all([
    User.countDocuments(estado),
    User.find(estado)
      .skip(Number(desde))
      .limit(Number(limite))
  ])
  res.json({total,limite,desde,usuarios});
}

const userPut=async(req, res=response) => {
  const id=req.params.id;
  const {_id,password,email, ...resto}=req.body;
  //  validar con la base de datos

  if(password){
    const salt=bcrypt.genSaltSync();
    resto.password=bcrypt.hashSync(password,salt);
  }

  const usuario=await User.findByIdAndUpdate(id, resto)
  res.json(
    usuario
    );
}
const registerUser=async(req, res) => {

  const {name,email,password}=req.body;
  const user=new User({name,email,password})
  user.token=generateToken();

  // guardar en la base de datos
  await user.save()
  res.json(user);
}
const userDelete=async(req, res) => {
  const {id} = req.params

  // /boarrar fisicamente no recomendable
  // const usuario =await User.findByIdAndDelete(id)
  const usuario =await User.findByIdAndUpdate(id,{ status:false})

  res.json(
    usuario
    );
}


const confirmAccount=async(req,res) => {
  const {token} = req.params;
  const usuarioConfirmado=await User.findOne({token});

  if(!usuarioConfirmado){
    return res.status(403).json({msg: `El token ${token} es invalido.`})
  }
  try {
    usuarioConfirmado.status = true;
    usuarioConfirmado.token = '';
    await usuarioConfirmado.save();
    return res.status(200).json({msg: `El usuario se ha confirmado correctamente.`});
  } catch (error) {
    return res.status(403).json({msg: error})
  }
}

module.exports ={
  getUsersConfirmed,
  usersNoConfirmed,
  userPut,
  registerUser,
  userDelete,
  confirmAccount
}