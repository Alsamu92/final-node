
const { crearSupermercado, toggleArticulo, borrarSuper, BuscarSuper, buscarNameSuper, update, buscarPorLugarSuper, getAll } = require("../controllers/Supermercado.controllers");

const SuperRoutes=require("express").Router()

SuperRoutes.post("/",crearSupermercado)
SuperRoutes.patch("/add/:id",toggleArticulo)
SuperRoutes.delete("/:id",borrarSuper)
SuperRoutes.get("/:id",BuscarSuper)
SuperRoutes.get("/name/:name",buscarNameSuper)
SuperRoutes.get("/",getAll)
SuperRoutes.get("/provincia/:usid",buscarPorLugarSuper)
SuperRoutes.patch("/:id",update)

module.exports=SuperRoutes