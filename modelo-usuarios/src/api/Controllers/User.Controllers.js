//todo-----------CONTROLADOR PARA SUBIR NUEVO USUARIO-------------------
const bcrypt = require("bcrypt");

const setError = require("../../../helpers/handle-error");
const { getSendEmail, setSendEmail } = require("../../state/state.data");
const randomCode = require("../../utils/randomCode");
const randomPassword = require("../../utils/randomPassword");
const sendEmail = require("../../utils/sendEmail");
const { generateToken } = require("../../utils/token");
const User = require("../models/User.model");
const nodemailer = require("nodemailer");
const validator=require("validator");
const enumOk = require("../../utils/enumOk");
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
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
          "https://res.cloudinary.com/dhkbe6djz/image/upload/v1689099748/UserFTProyect/tntqqfidpsmcmqdhuevb.png";
      }
      try {
        const usuarioGuardado = await newUser.save();
        if (usuarioGuardado) {
          const emailEnv = process.env.EMAIL;
          const password = process.env.PASSWORD;
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailEnv,
              pass: password,
            },
          });
          const mailOptions = {
            from: emailEnv,
            to: email,
            subject: "Confirmation code",
            text: `tu codigo es ${confirmationCode}, gracias por confiar en nosotros ${name}`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                user: usuarioGuardado,
                confirmationCode: "error",
              });
            } else {
              console.log(`email mandado` + info.response);
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
          error: "error al guardar",
          message: error.message,
        });
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(404).json("El ususario ya existe");
    }
  } catch (error) {
    req.file?.path && deleteImgCloudinary(catchImg);
    next(error);
    return (
      res.status(404).json({
        mensaje: "Error al crear",
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
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
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
                confirmationCode: "error, resend code",
              });
            }
          }, 1400);
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImg);
        return res.status(404).json({
          error: "error catch save",
          message: error.message,
        });
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    req.file && deleteImgCloudinary(catchImg);
    return (
      res.status(404).json({
        error: "error catch general",
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
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const usuarioGuardado = await newUser.save();
        if (usuarioGuardado) {
          return res.redirect(
            307,
            `http://localhost:8080/api/v1/users/register/sendMail/${usuarioGuardado._id}`
          );
        }
      } catch (error) {
        req.file && deleteImgCloudinary(catchImg);
        return res.status(404).json({
          error: "error al guardar",
          message: error.message,
        });
      }
    } else {
      req.file && deleteImgCloudinary(catchImg);
      return res.status(409).json("Este usuario ya está registrado");
    }

    req.file && deleteImgCloudinary(catchImg);
  } catch (error) {
    return (
      res.status(404).json({
        error: "error catch general",
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
      service: "gmail",
      auth: {
        user: emailEnv,
        pass: password,
      },
    });

    const mailOptions = {
      from: emailEnv,
      to: userDB.email,
      subject: "Confirmation code",
      text: `tu codigo es ${userDB.confirmationCode}, gracias por confiar en nosotros ${userDB.name}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json({
          user: userDB,
          confirmationCode: "error, resend code",
        });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          user: userDB,
          confirmationCode: userDB.confirmationCode,
        });
      }
    });
  } catch (error) {
    return (
      res.status(404).json({
        error: "Error en el catch general",
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
        return res.status(404).json("La contraseña no coincide");
      }
    } else {
      return res.status(404).json("usuario no registrado");
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
      service: "gmail",
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
        subject: "Confirmation code",
        text: `tu codigo es ${userExist.confirmationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(404).json({
            resend: false,
          });
        } else {
          console.log("Email enviado: " + info.response);
          return res.status(200).json({
            resend: true,
          });
        }
      });
    } else {
      return res.status(404).json("Usuario no encontrado");
    }
  } catch (error) {
    return next(setError(500, error.message || "Error general "));
  }
};
//todo---------------------------------------------------------------------
//todo-----------CHECK NEW USER--------------------------------------------

const checkUser = async (req, res, next) => {
  try {
    const { email, confirmationCode } = req.body;
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(404).json("Usuario no encontrado");
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
            error: "error en el catch update",
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
            ? "Error al borrar usuario"
            : "Usuario borrado",
        });
      }
    }
  } catch (error) {
    return next(setError(500, error.message || "error general"));
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
      return res.status(404).json("Usuario no registrado");
    }
  } catch (error) {
    return next(setError(500, error.message || "Error general"));
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
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });
    const mailOptions = {
      from: email,
      to: userDb.email,
      subject: "Nuevo código de acceso",
      text: `Usuario: ${userDb.name}. Tu nuevo código de acceso es  ${contrasenaSegura} Hemos enviado esto porque tenemos una solicitud de cambio de contraseña, si no has sido ponte en contacto con nosotros, gracias.`,
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        return res.status(404).json("No se ha podido enviar el email");
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
            error: "error catch al actualizar",
            message: error.message,
          });
        }
      }
    });
  } catch (error) {
    return next(setError(500, error.message || "Error general"));
  }
};

//todo -----------------------Cambiar contraseña logeado-------------------

const cambiarPass= async(req,res,next)=>{
  try {
    const{password,newPassword}=req.body
    const validarPass=validator.isStrongPassword(newPassword)
if(validarPass){
const{_id}=req.user
if(bcrypt.compareSync(password,req.user.password)){
const hasNewPass=bcrypt.hashSync(newPassword,10)
try {
  await User.findByIdAndUpdate(_id,{password:hasNewPass})
  const userActualizado=await  User.findById(_id)
  if(bcrypt.compareSync(newPassword,userActualizado.password)){
return res.status(200).json({updateUSer:true})
  }else{
    return res.status(404).json({updateUSer:false})
  }


} catch (error) {
  return res.status(404).json({
    error:"Error al actualizar la contraseña",
    message:error.message
  })
}

}else{
  return res.status(404).json("La contraseña no coincide")
}
}else{
  return res.status(404).json("La contraseña no es segura")
}

  } catch (error) {
    return next(
      setError(500,error.message || "Error general al cambiar contaseña")
    )
  }
}
//todo---------------------------------------------------------------------
//todo-----------CONTROLADOR PARA BORRAR USUARIO-------------------

const borrarUser = async (req, res, nex) => {
  try {
  await User.findByIdAndDelete(req.user?._id)
  deleteImgCloudinary(req.user?.image)

  const testDelete= await User.findById(req.user?._id)
  return res.status(testDelete?404:200).json({deleteTest:testDelete?false:true})

  } catch (error) {
    return res.status(404).json({
      message: "Error al borrar",
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
        if (updateUser[item] === req.body[item]) {ç
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
};
