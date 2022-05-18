const {Router}=require('express');
const { check } = require('express-validator');
const { userGet, userPut, registerUser, userDelete } = require('../controllers/user.controller');
const { esRoleValido,existeCorreo,existeID } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');


const router=Router();


router.get('/',userGet);

router.put('/:id',
  [
    check('id', "No es un id valido").isMongoId(),
    check('id').custom(existeID),
    check('role').custom(esRoleValido ),

    validarCampos,
  ],
userPut);
router.post('/', [
  check('name','El nombre es obligatorio').not().isEmpty(),
  check('password','La contraseña debe tener minimo 6 caracteres').isLength({ min: 6}),
  check('email','Correo no valido').isEmail(),
  check('email').custom(existeCorreo ),
  validarCampos
],registerUser);

router.delete('/:id', 
  [
    validarJWT,
    check('id', "No es un id valido").isMongoId(),
    check('id').custom(existeID),
    validarCampos
  ],
userDelete);


module.exports =router;