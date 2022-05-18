const { response } = require("express");

const login=(req,res=response) => {
  res.status(200).json({msg:'hola'});
}


module.exports ={login};