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

router.get('/users/qr_codes', async(req, res) => {
    let db;
    try{
        const account_id = req.body.account_id || req.query.account_id || req.params.account_id;

        if (!account_id) {
            return res.status(400).json({
                status: 400,
                msg: 'All fields are required',
            });
        }
        db = await connect();
        const query = 'SELECT qr_id, qr_data FROM qr_codes WHERE account_id = ?';
        const [rows] = await db.execute(query, [account_id]);


        if(rows.length > 0) {
            const qrData = rows[0];
            return res.json({
                'status': 200,
                'users': {rows},
            });
        } else {
            return res.json({
                'status':400,
                'msg': 'No QR found',
            });
        }
    } catch(err) {
        console.error('Error obtaining QR data:', err);
        return res.json({
            'status':500,
            'msg': 'Error'
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

router.get('/users/qr_token', async(req, res) => {
    let db;
    try {
        if (!token) {
            return res.status(401).json({ status: 401, msg: 'Unauthorized' });
          }
        
        db = await connect();
        const token = await AsyncStorage.getItem('userToken'); 
        const response = await fetch('https://api-bancamovil-production.up.railway.app/qr_codes', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
    
        if (data.status === 200) {
          setAccountNumber(data.qr_data.qr_id);
        } else {
          console.error('Error al obtener el QR:', data.msg);
        }
      } catch (err) {
        console.error('Error al hacer fetch:', err);
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