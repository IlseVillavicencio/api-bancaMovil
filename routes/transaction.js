const connect = require("../db");
const express = require('express');
const authVerify = require('../middleware/authVerify');
const router = express.Router(); 

router.post('/transfer', authVerify, async (req, res) => {
    console.log("User in request:", req.user_id);
    const{amount, qr_id, concept} = req.body;
    let db;

    try{
        if(!amount || !qr_id || !concept) {
            return res.json ({
                'status': 400,
                'msg': 'Todos los campos son obligatorios'
            });
        }

        db = await connect();


        const queryReceiverAccount = `SELECT account_id FROM qr_codes WHERE qr_id = ?`;
        const [receiverAccount] = await db.execute(queryReceiverAccount, [qr_id]);
        

        if (receiverAccount.length === 0) {
            return res.json({
                'status': 400,
                'msg': 'El codigo QR no corresponde a ninguna cuenta'
            });
        }


        const receiverAccountId = receiverAccount[0].account_id;
        

        await db.beginTransaction();
        

        try{
            const queryTransfer = `INSERT INTO transfers (from_account_id, to_account_id, amount) VALUES (?, ?, ?)`;
            await db.execute(queryTransfer, [req.user_id, receiverAccountId, amount]);

            const querySenderTrans = `INSERT INTO transactions (account_id, type, amount, concept, reference, created_at) VALUES (?, 'Transfer', ?, ?, ?, NOW())`;
            await db.execute(querySenderTrans, [req.user_id, amount, concept, qr_id]);

            const queryReceiverTrans = `INSERT INTO transactions (account_id, type, amount, concept, reference, created_at) VALUES (?, 'Receive', ?, ?, ?, NOW())`;
            await db.execute(queryReceiverTrans, [receiverAccountId, amount, concept, qr_id]);

            await db.commit();


        res.json({
            'status':200,
            'msg': 'Transferencia realizada con éxito'
        });

    } catch(err) {
        console.error('Error en la transacción:', err); 
        await db.rollback();
        res.json({
            'status': 500,
            'msg': 'Error al procesar la transferencia. Intentelo más tarde'
        });
    }
    } catch(err){
        console.error(err);
        res.json({
            'status': 500,
            'msg': 'Error en el servidor'
        });
    }
});

module.exports = router;