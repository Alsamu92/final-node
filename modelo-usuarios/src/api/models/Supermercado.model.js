const mongoose = require("mongoose");

const SuperMercadoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    numeroLocales: { type: Number, required: true },
    provincias: [{ type: String }],
    articulos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Articulo" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);





const Supermercado = mongoose.model("Supemercado", SuperMercadoSchema);

module.exports = Supermercado;
