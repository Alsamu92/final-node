const { isAuth } = require("../../middleware/auth.middleware")
const { crearComentario } = require("../Controllers/Comentario.controllers")

const ComentariosRoutes=require("express").Router()

ComentariosRoutes.post("/comentar/:articulo",[isAuth],crearComentario)

module.exports=ComentariosRoutes