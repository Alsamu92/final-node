const Articulo = require("../models/Articulo.model");
const Supermercado = require("../models/Supermercado.model");
const User = require("../models/User.model");

//todo CONTROLADOR POST

const crearSupermercado = async (req, res, next) => {
  try {
    await Supermercado.syncIndexes();
    const nuevoSupermercado = new Supermercado(req.body);
    const guardarSuper = await nuevoSupermercado.save();
    return res
      .status(guardarSuper ? 200 : 400)
      .json(guardarSuper ? guardarSuper : "Error al crear el Supermercado");
  } catch (error) {
    return (
      res.status(404).json({
        error: "error en el catch",
        message: error.message,
      }) && next(error)
    );
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------
//todo CONTROLADOR PATCH RELACIONAL

const toggleArticulo = async (req, res, next) => {

  //recibimos por el param el id del supermercado al que añadiremos el articulo
  const { id } = req.params;
  //por el body pasamos el id de los articulos que queremos añadir
  const { articulos } = req.body;
  const supermercadoByID = await Supermercado.findById(id);

  if (supermercadoByID) {
    const arrayArticulos = articulos.split(",");
    Promise.all(
      arrayArticulos.map(async (articulo) => {
        if (supermercadoByID.articulos.includes(articulo)) {
          try {
            await Supermercado.findByIdAndUpdate(id, {
              $pull: { articulos: articulo },
            });
            try {
              await Articulo.findByIdAndUpdate(articulo, {
                $pull: { supermercados: id },
              });
            } catch (error) {
              res.status(404).json({
                error: "error al actualizar el articulo",
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: "error al actualizar el supermercado",
              message: error.message,
            }) && next(error);
          }
        } else {
          try {
            await Supermercado.findByIdAndUpdate(id, {
              $push: { articulos: articulo },
            });
            try {
              await Articulo.findByIdAndUpdate(articulo, {
                $push: { supermercados: id },
              });
            } catch (error) {
              res.status(404).json({
                error: "error al actualizar el articulo",
                message: error.message,
              }) && next(error);
            }
          } catch (error) {
            res.status(404).json({
              error: "error al actualizar el supermercado",
              message: error.message,
            }) && next(error);
          }
        }
      })
    ).then(async () => {
      return res.status(200).json({
        dataUpdate: await Supermercado.findById(id),
      });
    });
  }
};

//todo-----------------------------------------------------------------------------------------------------------------------------------------

//todo CONTROLADOR BORRAR SUPER

const borrarSuper = async (req, res, nex) => {
  try {
    const { id } = req.params;
    const borrarSupermercado = await Supermercado.findByIdAndDelete(id);
    if (borrarSupermercado) {
      const findByIdSuper = await Supermercado.findById(id);
      try {
        //si hemos borrado el super debemos eliminar le id del super de los articulos
       const test= await Articulo.updateMany(
          {supermercados:id},
          {$pull: {supermercados:id}})
          console.log(test)
        return res.status(findByIdSuper ? 404 : 200).json({
          deleteTest: findByIdSuper ? false : true,
        });
      } catch (error) {}
     
    } else {
      return res.status(404).json("Este súper no está");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------

//todo CONTROLADOR BUSCAR POR ID

const BuscarSuper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const SuperPorId = await Supermercado.findById(id);
    if (SuperPorId) {
      return res.status(200).json(SuperPorId);
    } else {
      return res.status(404).json("No se ha encontrado");
    }
  } catch (error) {
    return res.status(404).json("No encontrado");
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------
//todo CONTROLADOR BUSCAR Todos

const getAll = async (rq, res, next) => {
  try {
    const TodosLosSupers = await Supermercado.find();
    if (TodosLosSupers.length > 0) {
      return res.status(200).json(TodosLosSupers);
    } else {
      return res.status(404).json("No se han encontrado artículos");
    }
  } catch (error) {
    return res.status(404).json({
      error: "error al buscar",
      message: error.message,
    });
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------

//todo CONTROLADOR BUSCAR POR NOMBRE
const buscarNameSuper = async (req, res, nex) => {
  try {
    const { name } = req.params;
    const nombreSuper = await Supermercado.find({ name });
    if (nombreSuper.length > 0) {
      return res.status(200).json(nombreSuper);
    } else {
      return res.status(404).json("No se ha encontado este super");
    }
  } catch (error) {
    return res.status(404).json({
      error: "No encontrado",
      message: error.message,
    });
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------

//todo CONTROLADOR UPDATE

const update = async (req, res, next) => {
  await Supermercado.syncIndexes();
  let catchImg = req.file?.path;
  try {
    const { id } = req.params;
    const SuperById = await Supermercado.findById(id);
    if (SuperById) {
      const oldImg = SuperById.image;

      const customBody = {
        _id: SuperById._id,
        image: req.file?.path ? catchImg : oldImg,
        name: req.body?.name ? req.body?.name : SuperById.name,
        price: req.body?.price ? req.body?.price : SuperById.price,
      };

      try {
        await Supermercado.findByIdAndUpdate(id, customBody);
        if (req.file?.path) {
          deleteImgCloudinary(oldImg);
        }
        const SuperByIdUpdate = await Supermercado.findById(id);

        const elementUpdate = Object.keys(req.body);

        let test = {};

        elementUpdate.forEach((item) => {
          if (req.body[item] === SuperByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        if (catchImg) {
          SuperByIdUpdate.image === catchImg
            ? (test = { ...test, file: true })
            : (test = { ...test, file: false });
        }
        let acc = 0;
        for (clave in test) {
          test[clave] == false && acc++;
        }

        if (acc > 0) {
          return res.status(404).json({
            dataTest: test,
            update: false,
          });
        } else {
          return res.status(200).json({
            dataTest: test,
            update: true,
          });
        }
      } catch (error) {}
    } else {
      return res.status(404).json("este Super no existe");
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

//todo CONTROLADOR BUSCAR POR Lugar
const buscarPorLugarSuper = async (req, res, nex) => {
  try {
    const {usid} = req.params;
    const todosSupers = await Supermercado.find();
    console.log(usid)
   
  const usuarioBuscado= await User.findById(usid)

    const supersCoincidentes= []
  
      todosSupers.forEach((supermercado)=>{
  
if(supermercado.provincias.includes(usuarioBuscado.provincia)){

 supersCoincidentes.push(supermercado)
}

     })
      if (supersCoincidentes.length > 0) {
        return res.status(200).json( supersCoincidentes);
      } else {
        return res.status(404).json("No se ha encontrado supermercados en esta provincia");
      }
     
     
   
  } catch (error) {
    return res.status(404).json({
      error: "No encontrado",
      message: error.message,
    });
  }
};
//todo------------------------------------------------------------------------------------------------------------------------------------

module.exports = {
  crearSupermercado,
  toggleArticulo,
  borrarSuper,
  BuscarSuper,
  buscarNameSuper,
  update,
  buscarPorLugarSuper,
  getAll
};
