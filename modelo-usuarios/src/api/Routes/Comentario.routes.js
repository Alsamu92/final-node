const { isAuth } = require("../../middleware/auth.middleware")
const { crearComentario, borrarComentario, buscarValoracion } = require("../Controllers/Comentario.controllers")

const ComentariosRoutes=require("express").Router()

ComentariosRoutes.post("/comentar/:articulo",[isAuth],crearComentario)
ComentariosRoutes.delete("/borrar/com/:comentario",[isAuth],borrarComentario)
ComentariosRoutes.get("/",buscarValoracion)

module.exports=ComentariosRoutes