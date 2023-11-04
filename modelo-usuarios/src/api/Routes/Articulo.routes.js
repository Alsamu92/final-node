const { upload } = require("../../middleware/files.middleware");
const { create,getByID,getAll,getByName,deleteArticulo,update } = require("../controllers/Articulo.controllers");

const ArticuloRoutes = require("express").Router();

ArticuloRoutes.post("/", upload.single("image"), create);
ArticuloRoutes.get("/", getAll);
ArticuloRoutes.get("/:id", getByID);
ArticuloRoutes.get("/byName/:name", getByName);
ArticuloRoutes.delete("/:id", deleteArticulo);
ArticuloRoutes.patch("/:id",upload.single("image"), update);

module.exports = ArticuloRoutes;
