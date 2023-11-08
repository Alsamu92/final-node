
const { isAuth } = require("../../middleware/auth.middleware");
const { crearSupermercado, toggleArticulo, borrarSuper, BuscarSuper, buscarNameSuper, update, buscarPorLugarSuper, getAll, mostrarConMasArt, mostrarConMasLocales } = require("../controllers/Supermercado.controllers");

const SuperRoutes=require("express").Router()

SuperRoutes.post("/",crearSupermercado)
SuperRoutes.patch("/add/:id",toggleArticulo)
SuperRoutes.delete("/:id",borrarSuper)
SuperRoutes.get("/:id",BuscarSuper)
SuperRoutes.get("/name/:name",buscarNameSuper)
SuperRoutes.get("/",getAll)
SuperRoutes.get("/provincia/buscar", [isAuth], buscarPorLugarSuper)
SuperRoutes.get("/cantidad/articulos/",mostrarConMasArt)
SuperRoutes.get("/locales/locales/",mostrarConMasLocales)

SuperRoutes.patch("/:id",update)

module.exports=SuperRoutes