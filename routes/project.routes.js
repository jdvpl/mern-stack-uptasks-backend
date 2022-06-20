const {Router}=require('express');
const { check } = require('express-validator');
const { createProject, getProjectById, updateProject, deleteProject, getProjects, addCollaborators, deleteCollaborator, searchCollaborators, } = require('../controllers/projects.controller');
const { existeProductoById, noExisteCorreo } = require('../helpers/db-validators');
const { checkAuth } = require('../middlewares/check-auth');
const { validarCampos } = require('../middlewares/validar-campos');

const router=Router();

// obtener todas los projectos
router.get('/',[checkAuth,validarCampos],getProjects);

// categoria por id
router.get('/:id',
  [
    checkAuth,
    check('id','No es un id de mongo valido').isMongoId(),
    check('id').custom(existeProductoById),
    validarCampos
  ]
,getProjectById);


// get collaborators
router.post('/collaborators',
[
  checkAuth,
  check('email','Correo no valido').isEmail(),
  check('email').custom(noExisteCorreo),
  validarCampos],
searchCollaborators);
// add colaborator
router.post('/collaborators/:id',
  [checkAuth,
    check('id').custom(existeProductoById),
    check('email').custom(noExisteCorreo),
    validarCampos],
addCollaborators);

// delete colaborator
router.post('/delete-collaborator/:id',
  [checkAuth,
    check('id').custom(existeProductoById),
  validarCampos]
,deleteCollaborator);

// crear categoria
router.post('/',[
  checkAuth,
  check('name',"el nombre es obligatorio").not().isEmpty(),
  check('description',"La descripcion es obligatoria").not().isEmpty(),
  validarCampos
],createProject);

// categoria actualizar
router.put('/:id',
  [
    checkAuth,
    check('id','No es un id de mongo valido').isMongoId(),
    check('id').custom(existeProductoById),
    check('name',"el nombre es obligatorio").not().isEmpty(),
    validarCampos,
  ]
  ,updateProject);


// borrar categoria solo si es admin borrar logico
router.delete('/:id',
  [
    checkAuth,
    check('id','No es un id de mongo valido').isMongoId(),
    check('id').custom(existeProductoById),
    validarCampos,
  ]
,deleteProject);
module.exports =router;