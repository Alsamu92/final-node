const { isAuth } = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/files.middleware');
const {
  subirUser,
  borrarUser,
  update,
  registerEstado,
  login,
  sendCode,
  registerRedirect,
  checkUser,
  sendPassword,
  cambiarContrasena,
  cambiarPass,
  hacerSuperFav,
  hacerArticuloFav,
  getAll,
  buscarNameUser,
  BuscarUser,
  seguirUser,
} = require('../Controllers/User.Controllers');

const UserRoutes = require('express').Router();

UserRoutes.get('/', getAll);
UserRoutes.get('/byName/:name', buscarNameUser);
UserRoutes.get('/:id', BuscarUser);

UserRoutes.post('/', upload.single('image'), subirUser);
UserRoutes.post('/register/estado/', upload.single('image'), registerEstado);

UserRoutes.post('/login', login);
UserRoutes.post('/redirect/', upload.single('image'), registerRedirect);
UserRoutes.post('/check', checkUser);
UserRoutes.patch('/cambiarpass/cambiarpass/', cambiarContrasena);
UserRoutes.patch('/cambiarlogeado/', [isAuth], cambiarPass);
UserRoutes.patch('/update/update', [isAuth], upload.single('image'), update);
UserRoutes.delete('/', [isAuth], borrarUser);
UserRoutes.patch('/hacersuperfav/:idSuper', [isAuth], hacerSuperFav);
UserRoutes.patch('/hacerfavarticulo/:idArticulo', [isAuth], hacerArticuloFav);
UserRoutes.patch('/seguiruser/:userSeguido', [isAuth], seguirUser);

//rutas con redirect
UserRoutes.post('/register/sendmail/:id', sendCode);
UserRoutes.patch('/sendPassword/:id', sendPassword);
module.exports = UserRoutes;
