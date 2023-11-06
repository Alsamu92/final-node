const { upload } = require("../../middleware/files.middleware");
const { create,getByID,getAll,getByName,deleteArticulo,update, getByCategoria, ordenarLikes } = require("../controllers/Articulo.controllers");

const ArticuloRoutes = require("express").Router();

ArticuloRoutes.post("/", upload.single("image"), create);
ArticuloRoutes.get("/", getAll);
ArticuloRoutes.get("/:id", getByID);
ArticuloRoutes.get("/ordenarlikes/orden",ordenarLikes)
ArticuloRoutes.get("/byName/:name", getByName);
ArticuloRoutes.get("/byCate/:categoria", getByCategoria);
ArticuloRoutes.delete("/:id", deleteArticulo);
ArticuloRoutes.patch("/:id",upload.single("image"), update);

module.exports = ArticuloRoutes;
