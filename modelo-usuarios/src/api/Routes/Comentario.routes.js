const { isAuth } = require("../../middleware/auth.middleware")
const { crearComentario, borrarComentario } = require("../Controllers/Comentario.controllers")

const ComentariosRoutes=require("express").Router()

ComentariosRoutes.post("/comentar/:articulo",[isAuth],crearComentario)
ComentariosRoutes.delete("/borrar/com/:comentario",[isAuth],borrarComentario)

module.exports=ComentariosRoutes