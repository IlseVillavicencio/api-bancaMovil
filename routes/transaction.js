const connect = require("../db");
const router = require("./usuarios");


router.post('/transfer', authenticateToken, async (req, res) => {
    const{amount, qr_id, concept} = req.body;
    let db;

    try{
        if(!amount || !qr_id) {
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

        const queryBalance = `SELECT balance FROM accounts WHERE account_id = ?`;
        const [senderAccount] = await db.execute(queryBalance, [req.user.account_id]);

        if(senderAccount[0].balance < amount) {
            return res.json({
                'status':400,
                'msg': 'No cuentas con el saldo suficiente'
            });

        }

        const queryTransacction = `INSERT INTO transacctions(account_id, transaction_type, amount, concept, qr_id) VALUES(?, 'TRANSFER', ?, ?, ?)`;
        await db.execute(queryTransacction, [req.user.account_id, amount, concept, qr_id]);

        //Falta agregar la actualizacion de la cuenta luega de la transferencia


        res.json({
            'status':200,
            'msg': 'Transferencia realizada con éxito'
        });
    } catch(err){
        console.error(err);
        res.json({
            'status': 500,
            'msg': 'Error en el servidor'
        });
    }
});

module.exports = router;