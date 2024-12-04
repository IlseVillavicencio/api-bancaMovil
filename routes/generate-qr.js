const router = require("./usuarios");

router.post('/generate-qr', authenticateToken, async (req, res) => {
    const { qr_data } = req.body;
    let db;

    try {
        if (!qr_data) {
            return res.json({
                'status': 400,
                'msg': 'Todos los datos son obligatorios'
            });
            
        }

        const queryInsertQR = `INSERT INTO qr_codes (account_id, qr_data) VALUES (?, ?)`;
        const [result] = await db.execute(queryInsertQR, [req.user.account_id, qr_data]);

        res.json({
            'status':200,
            'msg': 'Codigo QR generado con exito'

        });

    } catch (err) {
        console.error(err);
        res.json({
            'status':500,
            'msg': 'Error en el servidor'
        });
    }

});