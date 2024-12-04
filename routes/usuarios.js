const { Router } = require('express');
const connect = require('../db');
const bcrypt = require('bcrypt');
const router = Router();
const authVerify = require('../middleware/authVerify');

router.get('/users', async (req, res) =>{
    let db;
    try {
        db = await connect();
        const query = `SELECT * FROM users`;
        const [row] = await db.execute(query);
        console.log(row);
        res.json({
            'status': 200,
            'users': row
        });
    } catch(err) {
        console.log(err);
        res.json({
            'status': 500,
            'msg': 'Error al obtener los usuarios'
        });
    }
});

router.post('/users', async(req, res) => {
    let db;
    try {
        const {email, first_name, last_name, password_hash} = req.body;
        if( !first_name || !last_name || !email || !password_hash) {
            return res.json({
                'status':400,
                'msg': 'Todos los campos son obligatorios.'
            });
        } 

        const emailNoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailNoValido.test(email)) {
            return res.json({
                'status':400,
                'msg': 'El email no es valido'
            });
        }

        if(password_hash.length < 8){
            return res.json({
                'status':400,
                'msg': 'La contraseña debe tener al menos 8 caracteres'
            });
        }
        
        const saltRound = 10;
        db = await connect();
        const hashPassword = await bcrypt.hash(password_hash, saltRound);
        console.log(hashPassword);
        const query = `INSERT INTO users(first_name, last_name, email, password_hash) VALUES('${first_name}', '${last_name}', '${email}', '${password_hash}')`;
        const [row] = await db.execute(query);
        console.log(row);
        res.json({
            'status': 200,
            'msg': 'Usuario creado con exito',
            'users': row
        });
    } catch(err) {
        console.log(err);

        if(err.code === 'ER_DUP_ENTRY') {
            return res.json({
                'status':400,
                'msg': 'El email ya esta registrado'
            });
        }
        res.json({
            'status':500,
            'msg': 'Error al crear el usuario'
        });
    }
});

//Email
router.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    let db;
    try {
        db = await connect();
        console.log(email);
        const query = `SELECT * FROM users WHERE email = ?`;
        const [row] = await db.execute(query, [email]);
        console.log(row);

        if(row.length === 0) {
            return res.json({
                'status':404,
                'msg': 'Usuario no encontrado'
            })
        } res.json({
            'status': 200,
            'users': row
        });

    } catch(err) {
        console.log(err);
        res.json({
            'status':500,
            'msg': 'Error al obtener el usuario. Intentelo más tarde.'
        })
    }
});

//first_name

router.get('/users/:first_name', async (req, res) => {
    const first_name = req.params.first_name;
    let db;
    try {
        db = await connect();
        console.log(first_name);
        const query = `SELECT * FROM users WHERE first_name = ?`;
        const [row] = await db.execute(query, [first_name]);
        console.log(row);

        if(row.length === 0) {
            return res.json({
                'status':404,
                'msg': 'Usuario no encontrado'
            })
        } res.json({
            'status': 200,
            'users': row
        });

    } catch(err) {
        console.log(err);
        res.json({
            'status':500,
            'msg': 'Error al obtener el usuario. Intentelo más tarde.'
        })
    }
});

//last_name

router.get('/users/:last_name', async (req, res) => {
    const last_name = req.params.last_name;
    let db;
    try {
        db = await connect();
        console.log(last_name);
        const query = `SELECT * FROM users WHERE last_name = ?`;
        const [row] = await db.execute(query, [last_name]);
        console.log(row);

        if(row.length === 0) {
            return res.json({
                'status':404,
                'msg': 'Usuario no encontrado'
            })
        } res.json({
            'status': 200,
            'users': row
        });

    } catch(err) {
        console.log(err);
        res.json({
            'status':500,
            'msg': 'Error al obtener el usuario. Intentelo más tarde.'
        })
    }
});

router.delete('/users/:email', authVerify, async (req, res) => {
    const email = req.params.email;
    console.log(req.email_users);
    let db;
    try {
        db = await connect();
        const query = `DELETE FROM users WHERE email = ?`;
        const [rows] = await db.execute(query, [email]);
        if(rows.affectedRows === 0) {
            res.json({
                'users': [],
                'status': 404,
                'msg': 'Email no encontrado',
            });
        } else {
            res.json({
                'status': 200,
                'users':[]
            });
        }
    } catch(err) {
        console.log(err);
    }
});

// Actualizar usuario (email, last_name, password_hash) por email
router.put('/users/:email', async (req, res) => {
    const email = req.params.email;
    const {last_name, new_email, password_hash } = req.body;

    try {
        db = await connect();

        // Actualización de email
        if (new_email) {
            const query = `UPDATE users SET email = ? WHERE email = ?`;
            const [rows] = await db.execute(query, [new_email, email]);
            if (rows.affectedRows === 0) {
                return res.json({
                    'status': 404,
                    'msg': 'Email no encontrado',
                });
            }
            return res.json({
                'status': 200,
                'msg': 'Email actualizado',
            });
        }

        // Actualizar apellido
        if (last_name) {
            const query = `UPDATE users SET last_name = ? WHERE email = ?`;
            const [rows] = await db.execute(query, [last_name, email]);
            if (rows.affectedRows === 0) {
                return res.json({
                    'status': 404,
                    'msg': 'Email no encontrado',
                });
            }
            return res.json({
                'status': 200,
                'msg': 'Apellido actualizado',
            });
        }

        // actualizar contraseña
        if (password_hash) {
            const query = `UPDATE users SET password_hash = ? WHERE email = ?`;
            const [rows] = await db.execute(query, [password_hash, email]);
            if (rows.affectedRows === 0) {
                return res.json({
                    'status': 404,
                    'msg': 'Email no encontrado',
                });
            }
            return res.json({
                'status': 200,
                'msg': 'Contraseña actualizada',
            });
        }

        return res.json({
            'status': 400,
            'msg': 'No se proporcionó ningún campo válido para actualizar',
        });

    } catch (err) {
        console.log(err);
        return res.json({
            'status': 500,
            'msg': 'Error al actualizar el usuario'
        });
    }
});



module.exports = router;