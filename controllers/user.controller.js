const {response}=require('express')
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


module.exports ={
   getUsersConfirmed,
   usersNoConfirmed,
  userPut,
  registerUser,
  userDelete
}