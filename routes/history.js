const { SELECT } = require("sequelize/lib/query-types");
const connect = require("../db");
const router = require("./usuarios");
const authVerify = require("../middleware/authVerify");

router.get('/transactions/history', authVerify, async (req, res) => {
    let db;
    try {
        db = await connect();

        const query =
        `SELECT * FROM transactions WHERE accound_id = ? AND transaction_type = ? ORDER BY created_at DESC`;

        const [transactions] = await db.execute(query, [req.user.account_id]);

        if(transactions.length === 0) {
            return res.json({
                'status':404,
                'msg': 'No se encontraron transacciones en esta cuenta'

            });
        } res.json({
            'status':200,
            'msg': 'Historial de transacciones',
            'transactions': transactions
        });

    } catch(err){
        console.error(err);
        res.json({
            'status':500,
            'msg': 'Error en el servidor'
        });
    }

});

module.exports = router;