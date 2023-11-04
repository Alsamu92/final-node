const mongoose = require("mongoose");

const SuperMercadoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    articulos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Articulo" }],
  },
  { timestamps: true }
);





const Supermercado = mongoose.model("Supemercado", SuperMercadoSchema);

module.exports = Supermercado;
