const jwt = require("jsonwebtoken");

function authVerify(req, res, next) {
    const token = req.header('Authorization');
    
    if(!token)
        return res.status(401).json({'Error': 'You do not have permission to enter'});
    bearer = token.split(' ')[1];
    try {
        const decoded = jwt.verify(bearer, 'secret');
        console.log('Decoded token:', decoded);
        
        req.user_id = decoded.user_id;
        next();
    } catch(err) {
        return res.status(401).json({'Error': 'An error occurred try again' + err});
    }
}

module.exports = authVerify;