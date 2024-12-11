const { SELECT } = require("sequelize/lib/query-types");
const connect = require("../db");
const router = require("./usuarios");
const authVerify = require("../middleware/authVerify");

router.get('/transactions', authVerify, async (req, res) => {
    const userId = req.user.id;
    let db;
    try {
        db = await connect();

        const query =
        `SELECT t.transaction_id, t.type, t.amount, t.concept, t.created_at
         FROM transactions t
         JOIN accounts a ON t.account_id = a.account_id
         WHERE a.user_id = ?
         ORDER BY t.created_at DESC`;

        const [transactions] = await db.execute(query, [req.user.account_id]);

        if(transactions.length === 0) {
            return res.json({
                'status':404,
                'msg': 'No transactions found in this account'

            });
        } res.json({
            'status':200,
            'msg': 'Transaction history',
            'users': [userId],
            'transactions': transactions
        });

    } catch(err){
        console.error(err);
        res.json({
            'status':500,
            'msg': 'Server error'
        });
    }

});

module.exports = router;