const mongoose = require("mongoose");

const ComentarioSchema = new mongoose.Schema(
  {
    publicadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contenido: [{ type: String }],
    valoracion: [{
        type: String,
        enum: ["1","2","3","4","5"],
        required: true,
      }],
    articuloRef: { type: mongoose.Schema.Types.ObjectId, ref: "Articulo" },
    supermercado: { type: mongoose.Schema.Types.ObjectId, ref: "Supermercado" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    //aqui entra el id de los usuarios a los que les gusta este super
  },
  { timestamps: true }
);

const Comentario = mongoose.model("Comentario", ComentarioSchema);

module.exports = Comentario;
