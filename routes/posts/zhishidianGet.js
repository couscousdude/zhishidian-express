'use strict'
const mysql = require('promise-mysql');

const zhishidianGet = async (req, res) => {
    const { startId } = req.params;

    const connection = await mysql.createConnection({
        host: process.env.mysqlEndpoint,
        user: process.env.mysqlUsr,
        password: process.env.mysqlPwd,
        database: 'zhishidian',
    });
    
    const query = startId == 0 
     ? `SELECT id, title, author, content, UNIX_TIMESTAMP(created_at) AS time FROM posts ORDER BY time DESC LIMIT 21`
     : `SELECT id, title, author, content, UNIX_TIMESTAMP(created_at) AS time FROM posts WHERE id < ${startId} ORDER BY time DESC LIMIT 21`;
    
    let result;
    let statusCode;

    try {
        result = await connection.query(query);
        
        if (result.length) {
            result[0].statusCode = 200;
            statusCode = 200;
        } else {
            result = {statusCode: 404, message: 'Not found'};
            statusCode =  404;
        }
    } catch (error) {
        result = {statusCode: 403, message: `Error: ${error}`};
        statusCode = 403;
    } finally {
        connection.end();
    }

    res.set('Content-Type', 'application/json');
    res.set('access-control-allow-origin', '*');

    res.status(statusCode).send(JSON.stringify(result));
};

module.exports = zhishidianGet;