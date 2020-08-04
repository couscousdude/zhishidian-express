const mysql = require('promise-mysql');

const zhishidianGetUserPosts = async (req, res) => {
    const { userid } = req.params;
    const { startId } = req.query;

    const connection = await mysql.createConnection({
        host: process.env.mysqlEndpoint,
        user: process.env.mysqlUsr,
        password: process.env.mysqlPwd,
        database: 'zhishidian',
    });
    
    const query = startId == 0 
     ? `SELECT id, title, author, content, UNIX_TIMESTAMP(created_at) AS time FROM posts WHERE user_id=${mysql.escape(userid)} ORDER BY time DESC LIMIT 21`
     : `SELECT id, title, author, content, UNIX_TIMESTAMP(created_at) AS time FROM posts WHERE id < ${mysql.escape(startId)} AND user_id=${mysql.escape(userid)} ORDER BY time DESC LIMIT 21`;
    
    let result;
    let statusCode;

    try {      
        result = await connection.query(query);
        if (result.length) {
            statusCode = 200;
        } else {
            statusCode = 404;
            result = {statusCode: 404, message: 'No results found'};
        }
    } catch (error) {
        result = {statusCode: 403, message: `Error occurred: ${error}`};
        statusCode = 403;
    } finally {
        connection.end();
    }

    res.set('Content-Type', 'application/json');
    res.set('access-control-allow-origin', '*');

    res.status(statusCode).send(result);
}

module.exports = zhishidianGetUserPosts;