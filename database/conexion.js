const mysql = require('mysql');



const db = mysql.createConnection({
    host: "localhost",
    user: "pma",
    password: "Adm1NBcusc@",
    database: "hospital_unicaesv3"
});


db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

module.exports = db;
