const connect = require("../db");
const authVerify = require("../middleware/authVerify");
const router = require("./usuarios");

router.post('/generate-qr', authVerify, async (req, res) => {
    const { qr_data } = req.body;
    const accountId = req.user.accountId;
    let db;

    try {

        db= await connect();

        if(!qr_data) {
            return res.json({
                'status':400,
                'msg': 'All data is mandatory'
            });
        }

        if(!accountId){
            return res.json({
                'status': 400,
                'msg': 'The account associated with this user was not found'
            });
        }

        const qrData = req.body.qr_data;

    
        const queryInsertQR = `INSERT INTO qr_codes (account_id, qr_data) VALUES (?, ?)`;
        const [result] = await db.execute(queryInsertQR, [account_id, qrData]);

        const qrCodeImage = await QRCode.toDataURL(qrData);

        res.json({
            'status':200,
            'msg': 'QR code generated successfully',
            'qrCodeImage': qrCodeImage,
            'qrData': qrData

        });

    } catch (err) {
        console.error(err);
        res.json({
            'status':500,
            'msg': 'Server error'
        });
    }

});

module.exports = router;