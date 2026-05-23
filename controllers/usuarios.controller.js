const db = require('../db');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');



// 🔐 CLAVE SECRETA
const SECRET = 'secreto123';



// 🔐 REGISTRO
const register = async (req, res) => {

  try {

    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {

      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });

    }

    // 🔍 VALIDAR SI YA EXISTE
    db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email],
      async (err, result) => {

        if (err) {

          return res.status(500).json({
            error: 'Error en BD'
          });

        }

        if (result.length > 0) {

          return res.status(400).json({
            error: 'El usuario ya existe'
          });

        }

        // 🔒 ENCRIPTAR CONTRASEÑA
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
          INSERT INTO usuarios
          (nombre, email, password, rol)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          sql,
          [nombre, email, hashedPassword, rol],
          (err) => {

            if (err) {

              console.error(err);

              return res.status(500).json({
                error: 'Error al registrar usuario'
              });

            }

            res.json({
              ok: true,
              mensaje: 'Usuario registrado correctamente'
            });

          }
        );

      }
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error del servidor'
    });

  }

};



// 🔐 LOGIN
const login = (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        error: 'Email y password requeridos'
      });

    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(sql, [email], async (err, results) => {

      if (err) {

        return res.status(500).json({
          error: 'Error en BD'
        });

      }

      if (results.length === 0) {

        return res.status(404).json({
          error: 'Usuario no encontrado'
        });

      }

      const user = results[0];

      // 🔒 COMPARAR PASSWORD
      const validPassword = await bcrypt.compare(
        password,
        user.password
      );

      if (!validPassword) {

        return res.status(401).json({
          error: 'Contraseña incorrecta'
        });

      }

      // 🔥 TOKEN
      const token = jwt.sign(
        {
          id: user.id,
          rol: user.rol
        },
        SECRET,
        {
          expiresIn: '1h'
        }
      );

      res.json({

        ok: true,

        token,

        usuario: {
          id: user.id,
          nombre: user.nombre,
          rol: user.rol
        }

      });

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error del servidor'
    });

  }

};



// 👨‍💼 CREAR USUARIO
const createUsuario = async (req, res) => {

  try {

    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {

      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });

    }

    // 🔍 VALIDAR EMAIL
    db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email],
      async (err, result) => {

        if (err) {

          return res.status(500).json({
            error: 'Error en BD'
          });

        }

        if (result.length > 0) {

          return res.status(400).json({
            error: 'El usuario ya existe'
          });

        }

        // 🔒 ENCRIPTAR PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
          INSERT INTO usuarios
          (nombre, email, password, rol)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          sql,
          [nombre, email, hashedPassword, rol],
          (err) => {

            if (err) {

              console.error(err);

              return res.status(500).json({
                error: 'Error al crear usuario'
              });

            }

            res.status(201).json({
              ok: true,
              mensaje: 'Usuario creado correctamente'
            });

          }
        );

      }
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error interno'
    });

  }

};



// 🗑️ ELIMINAR USUARIO
const deleteUsuario = (req, res) => {

  try {

    const { id } = req.params;

    db.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id],
      (err) => {

        if (err) {

          console.error(err);

          return res.status(500).json({
            error: 'Error al eliminar usuario'
          });

        }

        res.json({
          ok: true,
          mensaje: 'Usuario eliminado correctamente'
        });

      }
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error interno'
    });

  }

};



// 📦 EXPORTAR
module.exports = {

  register,
  login,
  createUsuario,
  deleteUsuario

};