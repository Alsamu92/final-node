const setError = require("../../../helpers/handle-error");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Articulo = require("../models/Articulo.model");
const Comentario = require("../models/Comentarios.model");
const Supermercado = require("../models/Supermercado.model");
const User = require("../models/User.model");


//todo CONTROLADOR POST
const crearComentario = async (req, res, next) => {
    try {
        await User.syncIndexes();
        const {articulo}=req.params
       const{_id}=req.user
const articuloRef=await Articulo.findById(articulo)
const publicadoPor=await User.findById(_id)
          const newComentario = new Comentario({ ...req.body, articuloRef,publicadoPor});
         
    
          try {
            const comentarioGuardado = await newComentario.save();
            if (comentarioGuardado) {
              return res.status(200).json("Comentario guardado");
            }
          } catch (error) {
        
            return res.status(404).json({
              error: "error al guardar",
              message: error.message,
            });
          }

      } catch (error) {
        return (
          res.status(404).json({
            error: "error catch general",
            message: error.message,
          }) && next(error)
        );
      }
};

module.exports = { crearComentario };
