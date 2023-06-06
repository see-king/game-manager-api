const mysql2 = require("mysql2")



const pool = mysql2.createPool({
    host: process.env["DB_REMOTE_HOST"] || 'localhost',
    port: process.env["DB_REMOTE_PORT"] || '3306',
    database: process.env["DB_REMOTE_DATABASE"],
    user: process.env["DB_REMOTE_USER"],
    password: process.env["DB_REMOTE_PASSWORD"]
})


module.exports= pool.promise()