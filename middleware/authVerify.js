const jwt = require("jsonwebtoken");

function authVerify(req, res, next) {
    const token = req.header('Authorization');
    
    if(!token)
        return res.status(401).json({'error': 'No tiene permiso para ingresar'});
    bearer = token.split(' ')[1];
    try {
        const decoded = jwt.verify(bearer, 'secret');
        console.log('Decoded token:', decoded);
        
        req.user_id = decoded.user_id;
        next();
    } catch(err) {
        return res.status(401).json({'error': 'Ocurrió un error volver a intentarlo' + err});
    }
}

module.exports = authVerify;