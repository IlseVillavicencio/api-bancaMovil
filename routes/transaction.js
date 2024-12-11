const connect = require("../db");
const express = require('express');
const authVerify = require('../middleware/authVerify');
const router = express.Router(); 

router.post('/transfer', authVerify, async (req, res) => {
    const{amount, qr_id, concept} = req.body;
    let db;

    try{
        if(!amount || !qr_id || !concept) {
            return res.json ({
                'status': 400,
                'msg': 'All fields are required'
            });
        }

        db = await connect();


        const queryReceiverAccount = `SELECT account_id FROM qr_codes WHERE qr_id = ?`;
        const [receiverAccount] = await db.execute(queryReceiverAccount, [qr_id]);
        

        if (receiverAccount.length === 0) {
            return res.json({
                'status': 400,
                'msg': 'The QR code does not correspond to any account'
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
            'msg': 'Transfer completed successfully'
        });

    } catch(err) {
        console.error('Transaction error:', err); 
        await db.rollback();
        res.json({
            'status': 500,
            'msg': 'Error processing the transfer. Try again later.'
        });
    }
    } catch(err){
        console.error(err);
        res.json({
            'status': 500,
            'msg': 'Server error'
        });
    }
});

router.get("/transactions", authVerify, async (req, res) => {
    const userId = req.user.id; 

    try {
      const [transactions] = await db.query(
        `SELECT t.transaction_id, t.type, t.amount, t.concept, t.created_at
         FROM transactions t
         JOIN accounts a ON t.account_id = a.account_id
         WHERE a.user_id = ?
         ORDER BY t.created_at DESC`,
        [userId]
      );

      res.json({ transactions });
    }catch(error) {
      console.error("Error fetching transactions:", error);
      res.json({ 
        'status':500,
        'message': "Error fetching transactions" });
    }
  });
  
module.exports = router;