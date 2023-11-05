
const { isAuth } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const { subirUser, borrarUser, update, registerEstado, login, sendCode, registerRedirect, checkUser, sendPassword, cambiarContrasena, cambiarPass } = require("../Controllers/User.Controllers")

const UserRoutes=require("express").Router()



UserRoutes.post("/",upload.single("image"),subirUser)
UserRoutes.post("/register/estado/",upload.single("image"),registerEstado)

UserRoutes.post("/login", login)
UserRoutes.post("/redirect/",upload.single("image"),registerRedirect)
UserRoutes.post("/check",checkUser)
UserRoutes.patch("/cambiarpass/cambiarpass/",cambiarContrasena)
UserRoutes.patch("/cambiarlogeado/",[isAuth], cambiarPass)
UserRoutes.patch('/update/update', [isAuth], upload.single('image'), update);
UserRoutes.delete("/",[isAuth], borrarUser)


//rutas con redirect
UserRoutes.post("/register/sendMail/:id",sendCode)
UserRoutes.patch("/sendPassword/:id",sendPassword)
module.exports=UserRoutes

