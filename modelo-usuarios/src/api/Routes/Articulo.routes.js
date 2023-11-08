const { isAuth, isAuthAdmin } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/files.middleware");
const {create,getByID,getAll,getByName,deleteArticulo,update, getByCategoria, ordenarLikes, VerOferta,   } = require("../Controllers/Articulo.controllers");


const ArticuloRoutes = require("express").Router();

ArticuloRoutes.post("/", upload.single("image"),[isAuthAdmin], create);
ArticuloRoutes.get("/", getAll);
ArticuloRoutes.get("/:id", getByID);
ArticuloRoutes.get("/ordenarlikes/orden",ordenarLikes)
ArticuloRoutes.get("/byName/:name", getByName);
ArticuloRoutes.get("/oferta/oferta/", VerOferta);
ArticuloRoutes.get("/byCate/:categoria", getByCategoria);
ArticuloRoutes.delete("/:id",[isAuthAdmin], deleteArticulo);
ArticuloRoutes.patch("/:id",upload.single("image"),[isAuthAdmin], update);


module.exports = ArticuloRoutes;

