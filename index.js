const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const users = require('./routes/usuarios');
const auth = require('./routes/auth');
const transaction = require('./routes/transaction'); 
const history = require('./routes/history');
const generate_qr = require('./routes/generate-qr')
require('dotenv').config();


const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(users);
app.use(auth);
app.use(transaction);
app.use(history);
app.use(generate_qr);

app.listen(PORT, () => {
    console.log(`Escuchando por el puerto ${PORT}`); 
    //console.log("Escuchando por el puerto " + PORT); 
});