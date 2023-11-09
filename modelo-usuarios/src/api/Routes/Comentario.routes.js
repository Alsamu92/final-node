const { isAuth } = require("../../middleware/auth.middleware")
const { crearComentario, borrarComentario, buscarValoracion, ordenarPorValoracion } = require("../Controllers/Comentario.controllers")

const ComentariosRoutes=require("express").Router()

ComentariosRoutes.post("/comentar/:articulo",[isAuth],crearComentario)
ComentariosRoutes.delete("/borrar/com/:comentario",[isAuth],borrarComentario)
ComentariosRoutes.get("/",buscarValoracion)
ComentariosRoutes.get("/valoracion/",ordenarPorValoracion)

module.exports=ComentariosRoutes