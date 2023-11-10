const bcrypt = require('bcrypt');

const setError = require('../../../helpers/handle-error');
const { getSendEmail, setSendEmail } = require('../../state/state.data');
const randomCode = require('../../utils/randomCode');
const randomPassword = require('../../utils/randomPassword');
const sendEmail = require('../../utils/sendEmail');
const { generateToken } = require('../../utils/token');
const User = require('../models/User.model');
const nodemailer = require('nodemailer');
const validator = require('validator');
const { enumOk } = require('../../utils/enumOk');
const { deleteImgCloudinary } = require('../../middleware/files.middleware');
const Supermercado = require('../models/Supermercado.model');
const Articulo = require('../models/Articulo.model');
const Comentario = require('../models/Comentarios.model');

//todo-----------CONTROLADOR PARA SUBIR NUEVO USUARIO-------------------
const subirUser = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { name, email } = req.body;
    const userExiste = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );
    if (!userExiste) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (catchImg) {
        newUser.image = catchImg;
      } else {
        newUser.image =
          'https://res.cloudinary.com/dhkbe6djz/image/upload/v1689099748/UserFTProyect/tntqqfidpsmcmqdhuevb.png';
      }
      try {
        const usuarioGuardado = await newUser.save();
        if (usuarioGuardado) {
          const emailEnv = process.env.EMAIL;
          const password = process.env.PASSWORD;
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: emailEnv,
              pass: password,
            },
          });
          const mailOptions = {
            from: emailEnv,
            to: email,
            subject: 'Confirmation code',
            text: `tu codigo es ${confirmationCode}, gracias por confiar en nosotros ${name}`,
          };
          transporter.sendMail(mailOptions, function (error) {
            if (error) {
              // console.log(error);
              return res.status(404).json({
                user: usuarioGuardado,
                confirmationCode: 'error',
              });
            } else {
              // console.log(`email mandado` + info.response);
              return res.status(200).json({
                user: usuarioGuardado,
                confirmationCode,
              });
            }
          });
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImg);
        return res.status(404).json({
          error: 'error al guardar',
          message: error.message,
        });
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(404).json('El ususario ya existe');
    }
  } catch (error) {
    req.file?.path && deleteImgCloudinary(catchImg);
    next(error);
    return (
      res.status(404).json({
        mensaje: 'Error al crear',
        error: error,
      }) && next(error)
    );
  }
};

//todo---------------------------------------------------------------------

//todo-----------REGISTER ESTADO-------------------

const registerEstado = async (req, res, next) => {
  let catchImg = req.file?.path;

  try {
    await User.syncIndexes();

    let confirmationCode = randomCode();
    const { email, name } = req.body;

    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );

    if (!userExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = 'https://pic.onlinewebfonts.com/svg/img_181369.png';
      }

      try {
        const userSave = await newUser.save();

        if (userSave) {
          sendEmail(email, name, confirmationCode);

          setTimeout(() => {
            if (getSendEmail()) {
              setSendEmail(false);
              res.status(200).json({
                user: userSave,
                confirmationCode,
              });
            } else {
              setSendEmail(false);
              return res.status(404).json({
                user: userSave,
                confirmationCode: 'error, resend code',
              });
            }
          }, 1400);
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImg);
        return res.status(404).json({
          error: 'error catch save',
          message: error.message,
        });
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json('this user already exist');
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImg);
    return (
      res.status(404).json({
        error: 'error catch general',
        message: error.message,
      }) && next(error)
    );
  }
};

//todo---------------------------------------------------------------------
//todo-----------REGISTER CON REDIRECT-------------------
const registerRedirect = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    //establece esta variable para saber si ya esta registrado.
    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );

    if (!userExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = 'https://pic.onlinewebfonts.com/svg/img_181369.png';
      }

      try {
        const usuarioGuardado = await newUser.save();
        if (usuarioGuardado) {
          return res.redirect(
            307,
            `http://localhost:8080/api/v1/usuario/register/sendmail/${usuarioGuardado._id}`
          );
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImg);
        return res.status(404).json({
          error: 'error al guardar',
          message: error.message,
        });
      }
    } else {
      req.file && deleteImgCloudinary(catchImg);
      return res.status(409).json('Este usuario ya está registrado');
    }

    req.file && deleteImgCloudinary(catchImg);
  } catch (error) {
    return (
      res.status(404).json({
        error: 'error catch general',
        message: error.message,
      }) && next(error)
    );
  }
};

//todo -----------------------------------------------------------------------------
//todo ----------------------------SEND CODE CONFIRMATION--------------------------
//todo -----------------------------------------------------------------------------
//!Esta función será llamada al mandarse la petición por la ruta.

const sendCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDB = await User.findById(id);
    const emailEnv = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailEnv,
        pass: password,
      },
    });

    const mailOptions = {
      from: emailEnv,
      to: userDB.email,
      subject: 'Confirmation code',
      text: `Tu código es ${userDB.confirmationCode}, gracias por confiar en nosotros ${userDB.name}`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        // console.log(error);
        return res.status(404).json({
          user: userDB,
          confirmationCode: 'error, resend code',
        });
      } else {
        // console.log("Email sent: " + info.response);
        return res.status(200).json({
          user: userDB,
          confirmationCode: userDB.confirmationCode,
        });
      }
    });
  } catch (error) {
    return (
      res.status(404).json({
        error: 'Error en el catch general',
        message: error.message,
      }) && next(error)
    );
  }
};

//todo---------------------------------------------------------------------
//todo-----------LOGIN-------------------

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userDb = await User.findOne({ email });

    if (userDb) {
      //Si existe y conincide la pass generar el token
      if (bcrypt.compareSync(password, userDb.password)) {
        const token = generateToken(userDb._id, email);

        return res.status(200).json({
          user: userDb,
          token,
        });
      } else {
        return res.status(404).json('La contraseña no coincide');
      }
    } else {
      return res.status(404).json('usuario no registrado');
    }
  } catch (error) {
    return next(error);
  }
};
//todo---------------------------------------------------------------------
//todo-----------RESEND CODE-----------------------------------------------
const resendCode = async (req, res, next) => {
  try {
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });
    const userExist = await User.findOne({ email: req.body.email });

    if (userExist) {
      const mailOptions = {
        from: email,
        to: req.body.email,
        subject: 'Confirmation code',
        text: `tu codigo es ${userExist.confirmationCode}`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          // console.log(error);
          return res.status(404).json({
            resend: false,
          });
        } else {
          // console.log("Email enviado: " + info.response);
          return res.status(200).json({
            resend: true,
          });
        }
      });
    } else {
      return res.status(404).json('Usuario no encontrado');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error general '));
  }
};
//todo---------------------------------------------------------------------
//todo-----------CHECK NEW USER--------------------------------------------

const checkUser = async (req, res, next) => {
  try {
    const { email, confirmationCode } = req.body;
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(404).json('Usuario no encontrado');
    } else {
      if (userExist.confirmationCode == confirmationCode) {
        try {
          await userExist.updateOne({ check: true });
          const userActualizado = await User.findOne({ email });
          return res.status(200).json({
            testCkeckUser: userActualizado.check == true ? true : false,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error en el catch update',
            message: error.message,
          });
        }
      } else {
        await User.findByIdAndDelete(userExist._id);
        deleteImgCloudinary(userExist.image);
        return res.status(404).json({
          userExist,
          check: false,
          delete: (await User.findById(userExist._id))
            ? 'Error al borrar usuario'
            : 'Usuario borrado',
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || 'error general'));
  }
};

//todo---------------------------------------------------------------------
//todo-----------CAMBIO CONTRASEÑA DESLOGADO-------------------------------
const cambiarContrasena = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userDb = await User.findOne({ email });
    if (userDb) {
      return res.redirect(
        307,
        `http://localhost:8080/api/v1/usuario/sendPassword/${userDb._id}`
      );
    } else {
      return res.status(404).json('Usuario no registrado');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error general'));
  }
};
//todo REDIRECT ---SENDPASSWORD-------------------
const sendPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDb = await User.findById(id);
    const contrasenaSegura = randomPassword();

    //traer variables de entorno para nodemailer.
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });
    const mailOptions = {
      from: email,
      to: userDb.email,
      subject: 'Nuevo código de acceso',
      text: `Usuario: ${userDb.name}. Tu nuevo código de acceso es  ${contrasenaSegura} Hemos enviado esto porque tenemos una solicitud de cambio de contraseña, si no has sido ponte en contacto con nosotros, gracias.`,
    };
    transporter.sendMail(mailOptions, async function (error) {
      if (error) {
        return res.status(404).json('No se ha podido enviar el email');
      } else {
        const newPass = bcrypt.hashSync(contrasenaSegura, 10);
        await User.findByIdAndUpdate(id, { password: newPass });
        try {
          const usuarioActualizado = await User.findById(id);

          if (
            bcrypt.compareSync(contrasenaSegura, usuarioActualizado.password)
          ) {
            return res.status(200).json({
              updateUSer: true,
              sendPassword: true,
            });
          } else {
            return res.status(404).json({
              updateUSer: false,
              sendPassword: true,
            });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'error catch al actualizar',
            message: error.message,
          });
        }
      }
    });
  } catch (error) {
    return next(setError(500, error.message || 'Error general'));
  }
};

//todo -----------------------Cambiar contraseña logeado-------------------

const cambiarPass = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    const validarPass = validator.isStrongPassword(newPassword);
    if (validarPass) {
      const { _id } = req.user;
      if (bcrypt.compareSync(password, req.user.password)) {
        const hasNewPass = bcrypt.hashSync(newPassword, 10);
        try {
          await User.findByIdAndUpdate(_id, { password: hasNewPass });
          const userActualizado = await User.findById(_id);
          if (bcrypt.compareSync(newPassword, userActualizado.password)) {
            return res.status(200).json({ updateUSer: true });
          } else {
            return res.status(404).json({ updateUSer: false });
          }
        } catch (error) {
          return res.status(404).json({
            error: 'Error al actualizar la contraseña',
            message: error.message,
          });
        }
      } else {
        return res.status(404).json('La contraseña no coincide');
      }
    } else {
      return res.status(404).json('La contraseña no es segura');
    }
  } catch (error) {
    return next(
      setError(500, error.message || 'Error general al cambiar contaseña')
    );
  }
};
//todo---------------------------------------------------------------------
//todo-----------CONTROLADOR PARA BORRAR USUARIO-------------------

const borrarUser = async (req, res) => {
  try {
    const { _id } = req.user;
    console.log(req.user);

    // Eliminar el usuario por su ID
    await User.findByIdAndDelete(_id);

    // Eliminar la imagen asociada al usuario en Cloudinary
    deleteImgCloudinary(req.user?.image);

    // Actualizar los documentos en la colección "User" eliminando el ID del usuario del array "followed"
    await User.updateMany({ followed: _id }, { $pull: { followed: _id } });

    // Actualizar los documentos en las colecciones "Articulo" y "Supermercado" eliminando el ID del usuario del array "likes"
    await Articulo.updateMany({ likes: _id }, { $pull: { likes: _id } });

    await Supermercado.updateMany({ likes: _id }, { $pull: { likes: _id } });

    // Eliminar todos los comentarios hechos por el usuario
    const comentarios = await Comentario.find({ publicadoPor: _id });
    //Uso for of porque foreach me pide que haga asincrona la callback y prefiero asi.
    for (const comentario of comentarios) {
      await Comentario.findByIdAndDelete(comentario._id);
      await Articulo.updateMany(
        { comentarios: comentario._id },
        { $pull: { comentarios: comentario._id } }
      );
    }

    const existUser = await User.findById(_id);

    if (existUser) {
      return res.status(404).json({
        deleteTest: false,
      });
    } else {
      return res.status(200).json({
        deleteTest: true,
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: 'Error al borrar',
      error: error.message,
    });
  }
};

//todo-----------CONTROLADOR PARA ACTUALIZAR USUARIO-------------------

const update = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();
    // guardar lo que pasamos por la req en una variable
    const patchUser = new User(req.body);
    req.file && (patchUser.image = catchImg);

    /** la info que el user no puede cambiar */
    patchUser._id = req.user._id;
    patchUser.password = req.user.password;
    patchUser.rol = req.user.rol;
    patchUser.confirmationCode = req.user.confirmationCode;
    patchUser.email = req.user.email;
    patchUser.check = req.user.check;

    if (req.body?.gender) {
      const resultEnum = enumOk(req.body?.gender);
      patchUser.gender = resultEnum.check ? req.body?.gender : req.user.gender;
    }

    try {
      // actualizar cambiando la req.user._id ,que es lo que hay en bd por lo nuevo.
      await User.findByIdAndUpdate(req.user._id, patchUser);

      //si hay imagen nueva hay que borrar la vieja
      if (req.file) deleteImgCloudinary(req.user.image);

      //todo ------ Cerrar los catch que hacen el testing-------------------

      const updateUser = await User.findById(req.user._id);
      const updateKeys = Object.keys(req.body);
      const testUpdate = [];

      updateKeys.forEach((item) => {
        //la info tiene que ser igual en la db que lo que pidio que se cambiara
        if (updateUser[item] === req.body[item]) {
          //y tiene que ser de contenido diferente. no puedes cambiar genero de hombre a hombre
          if (updateUser[item] != req.user[item]) {
            testUpdate.push({
              [item]: true,
            });
          } else {
            testUpdate.push({
              [item]: 'La información no puede ser igual a la anterior',
            });
          }
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });

      if (req.file) {
        updateUser.image === catchImg
          ? testUpdate.push({
              image: true,
            })
          : testUpdate.push({
              image: false,
            });
      }

      return res.status(200).json({
        updateUser,
        testUpdate,
      });
    } catch (error) {
      req.file && deleteImgCloudinary(catchImg);
      return res.status(404).json({
        error: 'error catch update',
        message: error.message,
      });
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImg);
    return next(
      setError(500, error.message || 'Error general to UPDATE with AUTH')
    );
  }
};
//todo---------------------------------------------------------------------
//todo-----------CONTROLADOR PARA hacer favorito un Super-------------------

const hacerSuperFav = async (req, res, next) => {
  try {
    const { idSuper } = req.params;
    const { _id, SupermercadoFav } = req.user;

    if (SupermercadoFav.includes(idSuper)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { SupermercadoFav: idSuper },
        });
        try {
          await Supermercado.findByIdAndUpdate(idSuper, {
            $pull: { likes: _id },
          });

          return res.status(200).json({
            userActualizado: await User.findById(_id),
            superActualizado: await Supermercado.findById(idSuper),
            action: `Sacado el supermercado con id ${idSuper}`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'Error al actualizar pull de los supers',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'Error al actualizar pull',
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { SupermercadoFav: idSuper },
        });
        try {
          await Supermercado.findByIdAndUpdate(idSuper, {
            $push: { likes: _id },
          });

          return res.status(200).json({
            userActualizado: await User.findById(_id),
            superActualizado: await Supermercado.findById(idSuper),
            action: `Metido el supermercado con id ${idSuper}`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'Error al actualizar push de los supers',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'Error al actualizar push',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error en el catch general'));
  }
};

//todo---------------------------------------------------------------------
//todo-----------CONTROLADOR PARA hacer favorito un articulo-------------------

const hacerArticuloFav = async (req, res, next) => {
  try {
    const { idArticulo } = req.params;
    const { _id, ArticuloFav } = req.user;

    if (ArticuloFav.includes(idArticulo)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { ArticuloFav: idArticulo },
        });
        try {
          await Articulo.findByIdAndUpdate(idArticulo, {
            $pull: { likes: _id },
          });

          return res.status(200).json({
            userActualizado: await User.findById(_id),
            articuloActualizado: await Articulo.findById(idArticulo),
            action: `Sacado el artículo con id ${idArticulo}`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'Error al actualizar pull de los artículos',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'Error al actualizar pull',
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { ArticuloFav: idArticulo },
        });
        try {
          await Articulo.findByIdAndUpdate(idArticulo, {
            $push: { likes: _id },
          });

          return res.status(200).json({
            userActualizado: await User.findById(_id),
            articuloActualizado: await Articulo.findById(idArticulo),
            action: `Metido el artículo con id ${idArticulo}`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'Error al actualizar push de los artículos',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'Error al actualizar push',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error en el catch general'));
  }
};

//todo---------------------------------------------------------------------
//todo-----------------------------------------------------------------------------------------------------------------------------------------

//todo CONTROLADOR BUSCAR POR ID

const BuscarUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userPorId = await User.findById(id);
    if (userPorId) {
      return res.status(200).json(userPorId);
    } else {
      return res.status(404).json('No se ha encontrado');
    }
  } catch (error) {
    return res.status(404).json('No encontrado');
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------
//todo CONTROLADOR BUSCAR Todos

const getAll = async (rq, res) => {
  try {
    const todosLosUsers = await User.find();
    if (todosLosUsers.length > 0) {
      return res.status(200).json(todosLosUsers);
    } else {
      return res.status(404).json('No se han encontrado usuarios');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'error al buscar',
      message: error.message,
    });
  }
};
//todo-----------------------------------------------------------------------------------------------------------------------------------------

//todo CONTROLADOR BUSCAR POR NOMBRE
const buscarNameUser = async (req, res) => {
  try {
    const { name } = req.params;
    const nombreUser = await User.find({ name });
    if (nombreUser.length > 0) {
      return res.status(200).json(nombreUser);
    } else {
      return res.status(404).json('No se ha encontado este usuario');
    }
  } catch (error) {
    return res.status(404).json({
      error: 'No encontrado',
      message: error.message,
    });
  }
};
//todo---------------------------------------------------------------------
//todo-----------CONTROLADOR PARA SEGUIR A UN USER-------------------

const seguirUser = async (req, res, next) => {
  try {
    const { userSeguido } = req.params;
    const { _id, following } = req.user;

    if (following.includes(userSeguido)) {
      try {
        await User.findByIdAndUpdate(_id, {
          $pull: { following: userSeguido },
        });

        try {
          await User.findByIdAndUpdate(userSeguido, {
            $pull: { followed: _id },
          });

          return res.status(200).json({
            userUpdate: await User.findById(_id),
            userDosUpdate: await User.findById(userSeguido),
            action: `pull user ${userSeguido}`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error catch update pull',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error catch update User pull',
          message: error.message,
        });
      }
    } else {
      try {
        await User.findByIdAndUpdate(_id, {
          $push: { following: userSeguido },
        });

        try {
          await User.findByIdAndUpdate(userSeguido, {
            $push: { followed: _id },
          });

          return res.status(200).json({
            userUpdate: await User.findById(_id),
            userDosUpdate: await User.findById(userSeguido),
            action: `push user ${userSeguido}`,
          });
        } catch (error) {
          return res.status(404).json({
            error: 'error catch update push',
            message: error.message,
          });
        }
      } catch (error) {
        return res.status(404).json({
          error: 'error catch update User pull',
          message: error.message,
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error general to DELETE'));
  }
};

module.exports = {
  subirUser,
  borrarUser,
  update,
  registerEstado,
  login,
  registerRedirect,
  sendCode,
  checkUser,
  cambiarContrasena,
  sendPassword,
  cambiarPass,
  hacerSuperFav,
  hacerArticuloFav,
  getAll,
  buscarNameUser,
  BuscarUser,
  seguirUser,
  resendCode,
};
