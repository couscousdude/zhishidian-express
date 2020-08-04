const mysql = require('promise-mysql');

const zhishidianQuery = async (req, res) => {
    const { searchString, startId } = req.query;

    const connection = await mysql.createConnection({
        host: process.env.mysqlEndpoint,
        user: process.env.mysqlUsr,
        password: process.env.mysqlPwd,
        database: 'zhishidian',
    });

    // const query = `SELECT id, title, author, content, created_at AS time FROM posts WHERE MATCH(content) AGAINST('robux give')`;   // add limit later
    const query = startId == 0
    ? `SELECT id, title, author, content, UNIX_TIMESTAMP(created_at) AS time FROM posts WHERE MATCH(content) AGAINST(${mysql.escape(searchString)}) LIMIT 20`
    : `SELECT id, title, author, content, UNIX_TIMESTAMP(created_at) AS time FROM posts WHERE MATCH(content) AGAINST(${mysql.escape(searchString)}) AND id < ${startId} LIMIT 20`;
    
    let result;
    let statusCode;

    try {
        result = await connection.query(query);

        statusCode = 200;
    } catch(error) {
        result = JSON.stringify({statusCode: 403, message: `An error occurred: ${error}`});
        statusCode = 403;
    } finally {
        connection.end();
    }

    res.set('Content-Type', 'application/json');
    res.set('access-control-allow-origin', '*');

    res.status(statusCode).send(JSON.stringify(result));
}

module.exports = zhishidianQuery;