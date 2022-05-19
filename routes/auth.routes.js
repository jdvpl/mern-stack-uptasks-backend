const {Router}=require('express');
const { check } = require('express-validator');
const { login, profile } = require('../controllers/auth.controller');
const { checkAuth } = require('../middlewares/check-auth');
const { validarCampos } = require('../middlewares/validar-campos');

const router=Router();


router.post('/login',[
  check('email',"El correo es obligatorio").isEmail(),
  check('password',"La contraseña es obligatoria").not().isEmpty(),
  validarCampos
],login);

router.get('/profile',checkAuth,profile)


module.exports =router;