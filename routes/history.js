const connect = require("../db");
const express = require('express');
const authVerify = require('../middleware/authVerify');
const router = express.Router(); 

router.get('/transactions', authVerify, async (req, res) => {
    const userId = req.user_id;
    let db;


    try {
        db = await connect();

        const balanceQuery = `SELECT balance FROM accounts WHERE account_id = ?;`;
        
        const [balanceData] = await db.execute(balanceQuery, [userId]);
        const balance = balanceData[0].balance || 0; 

        const query =
        `SELECT t.transaction_id, t.type, t.amount, t.concept, DATE_FORMAT(t.created_at, '%d.%m.%Y') as created_at
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
            'balance': balance,
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