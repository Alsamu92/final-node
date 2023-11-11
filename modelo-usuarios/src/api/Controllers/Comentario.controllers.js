const Articulo = require('../models/Articulo.model');
const Comentario = require('../models/Comentarios.model');
const User = require('../models/User.model');

//todo CONTROLADOR POST----------------------------------------------------------------------------
const crearComentario = async (req, res, next) => {
  try {
    await User.syncIndexes();
    const { articulo } = req.params;
    const { _id } = req.user;
    const articuloRef = await Articulo.findById(articulo);
    const publicadoPor = await User.findById(_id);
    const newComentario = new Comentario({
      ...req.body,
      articuloRef,
      publicadoPor,
    });

    try {
      const comentarioGuardado = await newComentario.save();
      if (comentarioGuardado) {
        //si se ha guardado quiero actualizar el array de comentarios de los articulos y de los Users
        try {
          await User.findByIdAndUpdate(_id, {
            $push: { comentarios: comentarioGuardado._id },
          });
          try {
            await Articulo.findByIdAndUpdate(articulo, {
              $push: { comentarios: comentarioGuardado._id },
            });

            return res.status(200).json({
              userActualizado: await User.findById(_id),
              articuloActualizado: await Articulo.findById(articulo),
              action: `metido el comentario`,
            });
          } catch (error) {
            return res.status(404).json({
              error: 'Error al actualizar push de los usuarios',
              message: error.message,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'Error al actualizar push de artículos',
            message: error.message,
          });
        }
      }
    } catch (error) {
      return res.status(404).json({
        error: 'error al guardar',
        message: error.message,
      });
    }
  } catch (error) {
    return (
      res.status(404).json({
        error: 'error catch general',
        message: error.message,
      }) && next(error)
    );
  }
};
//todo BORRAR COMENTARIO----------------------------------------------------------------------------
const borrarComentario = async (req, res) => {
  const { comentario } = req.params;
  const { _id } = req.user;
  if (req.user?.comentarios.includes(comentario)) {
    try {
      await Comentario.findByIdAndDelete(comentario);

      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { comentarios: comentario },
        });
        try {
          await Articulo.updateMany(
            { comentarios: comentario },
            { $pull: { comentarios: comentario } }
          );
          const existComentario = await Comentario.findById(comentario);
          return res.status(existComentario ? 404 : 200).json({
            deleteTest: existComentario ? false : true,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error catch update Artículo',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error catch update User',
          message: error.message,
        });
      }
    } catch (error) {
      return res.status(404).json({
        error: 'error catch',
        message: error.message,
      });
    }
  } else {
    return res.status(404).json('solo puedes borrar tus propios comentarios');
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------

//todo CONTROLADOR BUSCAR todos los comentarios
const buscarValoracion = async (req, res) => {
  try {
    const TodosLosComentarios = await Comentario.find().populate(
      'articuloRef publicadoPor'
    );
    if (TodosLosComentarios.length > 0) {
      return res.status(200).json(TodosLosComentarios);
    } else {
      return res.status(404).json('No se han encontrado comentarios');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error al buscar',
      message: error.message,
    });
  }
};
const ordenarPorValoracion = async (req, res) => {
  try {
    const TodosLosComentarios = await Comentario.find().populate(
      'publicadoPor articuloRef'
    );
    if (TodosLosComentarios.length > 0) {
      TodosLosComentarios.sort(
        (a, b) =>
          b.TodosLosComentarios.valoracion - a.TodosLosComentarios.valoracion
      );

      return res.status(200).json(TodosLosComentarios);
    } else {
      return res.status(404).json({
        error: 'No se encontraron comentarios',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Error al buscar',
      message: error.message,
    });
  }
};
//todo CONTROLADOR UPDATE

const update = async (req, res) => {
  await Comentario.syncIndexes();
  try {
    const { id } = req.params;
    const comentById = await Comentario.findById(id);
    if (comentById) {
      const customBody = {
        _id: comentById._id,
        publicadoPor: comentById.publicadoPor,
        contenido: req.body?.contenido ? req.body?.contenido : comentById.price,
        valoracion: req.body?.valoracion
          ? req.body?.valoracion
          : comentById.valoracion,
      };

      try {
        await Comentario.findByIdAndUpdate(id, customBody);

        const comentByIdUpdate = await Comentario.findById(id);

        const elementUpdate = Object.keys(req.body);

        let test = {};

        elementUpdate.forEach((item) => {
          if (req.body[item] == comentByIdUpdate[item]) {
            test[item] = true;
          } else {
            test[item] = false;
          }
        });

        let acc = 0;
        for (let clave in test) {
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
      } catch (error) {
        return res.status(404).json('No');
      }
    } else {
      return res.status(404).json('este comentario no existe');
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};
module.exports = {
  crearComentario,
  borrarComentario,
  buscarValoracion,
  ordenarPorValoracion,
  update,
};
