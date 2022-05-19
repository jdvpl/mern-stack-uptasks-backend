const {Router}=require('express');
const { check } = require('express-validator');

const { getTask, createTask, updateTask, deleteTask, changeStatus } = require('../controllers/tasks.controller');
const { existeTareaById, existeProductoById } = require('../helpers/db-validators');
const { checkAuth } = require('../middlewares/check-auth');
const { validarCampos } = require('../middlewares/validar-campos');

const router=Router();


// tarea por id
router.get('/:id',
  [
    checkAuth,
    check('id','No es un id de mongo valido').isMongoId(),
    check('id').custom(existeTareaById),
    validarCampos
  ]
,getTask);

// crear tarea
router.post('/',[
  checkAuth,
  check('project','No es un id de mongo valido').isMongoId(),
  check('project').custom(existeProductoById),
  check('name',"el nombre es obligatorio").not().isEmpty(),
  check('description',"La descripcion es obligatoria").not().isEmpty(),
  validarCampos
],createTask);

// categoria actualizar
router.put('/:id',
  [
    checkAuth,
    check('id','No es un id de mongo valido').isMongoId(),
    check('id').custom(existeTareaById),
    validarCampos,
  ]
  ,updateTask);

// borrar categoria solo si es admin borrar logico
router.delete('/:id',
  [
    checkAuth,
    check('id','No es un id de mongo valido').isMongoId(),
    check('id').custom(existeTareaById),
    validarCampos,
  ]
,deleteTask);

router.post('/status/:id',
[checkAuth,
check('id','No es un id de mongo valido').isMongoId(),
check('id').custom(existeTareaById),
validarCampos],
changeStatus)
module.exports =router;