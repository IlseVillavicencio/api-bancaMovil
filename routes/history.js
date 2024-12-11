const connect = require("../db");
const express = require('express');
const authVerify = require('../middleware/authVerify');
const router = express.Router(); 

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

         const [transactions] = await db.execute(query, [userId]);

        if(transactions.length === 0) {
            return res.json({
                'status':404,
                'msg': 'No transactions found in this account'

            });
        } res.json({
            'status':200,
            'msg': 'Transaction history',
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