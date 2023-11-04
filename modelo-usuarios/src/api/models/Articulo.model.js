
const mongoose = require("mongoose");



const Schema = mongoose.Schema;


const ArticuloSchema = new Schema(
  {
    name: { type: String, required: false, unique: false },
    price: {
      type:String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    supermercados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supermercado" }],
  },
  {
    timestamps: true,
  }
);


const Articulo = mongoose.model("Articulo", ArticuloSchema);



module.exports = Articulo;
