
const mongoose = require("mongoose");



const Schema = mongoose.Schema;


const ArticuloSchema = new Schema(
  {
    name: { type: String, required: false, unique: true },
    oferta: { type: Boolean, required: false, unique: false },
    descripcion: { type: String, required: false, unique: false },
    categoria:{enum:["limpieza","alimentacion","juguetes","textil","electronica","drogueria"], type:String, required:true},
    price: {
      type:String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    supermercados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Supermercado" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);


const Articulo = mongoose.model("Articulo", ArticuloSchema);



module.exports = Articulo;
