const {Router}=require('express');
const { check } = require('express-validator');
const { createProject, getProjectById, updateProject, deleteProject, getProjects, getTasks, addCollaborators, deleteCollaborator, } = require('../controllers/projects.controller');
const { existeProductoById } = require('../helpers/db-validators');
const { checkAuth } = require('../middlewares/check-auth');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

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

router.get('/tareas/:id/:project',[checkAuth,validarCampos],getTasks)

router.post('/addCollaborators/:project',[checkAuth,validarCampos],addCollaborators);

router.post('/delete-collaborator/:project',[checkAuth,validarCampos],deleteCollaborator);
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