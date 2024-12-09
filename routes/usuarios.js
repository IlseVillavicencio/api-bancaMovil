const { Router } = require('express');
const connect = require('../db');
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
            'msg': 'Error getting users'
        });
    }
});

router.get('/qr_codes', async (req, res) => {
    let db;
    try {
      db = await connect();
  
     
      const account_id = req.headers['account_id'];
  
      const query = 'SELECT qr_id, qr_data FROM qr_codes WHERE account_id = ?';
      const [rows] = await db.execute(query, [account_id]);
  
      if (rows.length > 0) {
       
        const qrData = rows[0]; 
  
        res.json({
          status: 200,
          qr_data: {
            qr_id: qrData.qr_id,
            image_base64: qrData.qr_data, 
          },
        });
      } else {
        res.json({
          status: 404,
          msg: 'QR not found for this account_id',
        });
      }
    } catch (err) {
      console.log(err);
      res.json({
        status: 500,
        msg: 'Error getting QR data',
      });
    }
  });

  router.get('/account', async (req, res) => {
    let db;
    try {
        db = await connect();

        const accountId = req.headers['account_id'];
        console.log("account_id recibido:", accountId); 

        if (!accountId) {
            console.log("No se envió el account_id en los encabezados");
            return res.status(400).json({ status: 400, msg: "account_id is required" });
        }

        const query = 'SELECT * FROM accounts WHERE account_id = ?';
        const [rows] = await db.execute(query, [accountId]);
        console.log("Resultado de la consulta:", rows); 

        if (rows.length === 0) {
            console.log("No se encontró la cuenta para el account_id:", accountId);
            return res.status(404).json({ status: 404, msg: "Account not found" });
        }

        return res.status(200).json({
            status: 200,
            msg: "Account retrieved successfully",
            account: rows[0],
        });

    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return res.status(500).json({ status: 500, msg: "Internal server error" });
    } finally {
        if (db) {
            db.end(); 
        }
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
                'msg': 'User not found'
            })
        } res.json({
            'status': 200,
            'users': row
        });

    } catch(err) {
        console.log(err);
        res.json({
            'status':500,
            'msg': 'Error getting user. Please try again later.'
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
                'msg': 'User not found.'
            })
        } res.json({
            'status': 200,
            'users': row
        });

    } catch(err) {
        console.log(err);
        res.json({
            'status':500,
            'msg': 'Error getting user. Please try again later.'
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
                'msg': 'User not found'
            })
        } res.json({
            'status': 200,
            'users': row
        });

    } catch(err) {
        console.log(err);
        res.json({
            'status':500,
            'msg': 'Error getting user. Please try again later.'
        })
    }
});

//Eliminar cuenta

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
                'msg': 'Email not found',
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

// Update user (email, last_name, password) by email
router.put('/users/:email', async (req, res) => {
    const email = req.params.email;
    const {last_name, new_email, password} = req.body;

    try {
        db = await connect();

        // Email update
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
                'msg': 'Updated email',
            });
        }

        // Update last name
        if (last_name) {
            const query = `UPDATE users SET last_name = ? WHERE email = ?`;
            const [rows] = await db.execute(query, [last_name, email]);
            if (rows.affectedRows === 0) {
                return res.json({
                    'status': 404,
                    'msg': 'Email not found',
                });
            }
            return res.json({
                'status': 200,
                'msg': 'Last name updated',
            });
        }

        // update password
        if (password) {
            const bcrypt = require('bcrypt');
            const saltRounds = 10;

            const password = await bcrypt.hash(password, saltRounds);
            
            const query = `UPDATE users SET password = ? WHERE email = ?`;
            const [rows] = await db.execute(query, [password, email]);
            if (rows.affectedRows === 0) {
                return res.json({
                    'status': 404,
                    'msg': 'Email not found',
                });
            }
            return res.json({
                'status': 200,
                'msg': 'Updated password',
            });
        }

        return res.json({
            'status': 400,
            'msg': 'No valid field provided to update',
        });

    } catch (err) {
        console.log(err);
        return res.json({
            'status': 500,
            'msg': 'Error updating user'
        });
    }
});



module.exports = router;