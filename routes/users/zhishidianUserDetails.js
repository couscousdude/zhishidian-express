const mysql = require('promise-mysql');

const zhishidianUserDetails = async (req, res) => {
    const { username } = req.params;
    // const username='bubby';

    const connection = await mysql.createConnection({
        host: process.env.mysqlEndpoint,
        user: process.env.mysqlUsr,
        password: process.env.mysqlPwd,
        database: 'zhishidian',
    });

    let result;
    let statusCode;

    try {
        const query = `SELECT user_id, username, first_name, last_name, UNIX_TIMESTAMP(creation_date), user_type, profile_color, bio FROM users WHERE username=${mysql.escape(username)}`;
        
        result = await connection.query(query);
        
        if (result.length) {
            result[0].statusCode = 200;
            statusCode = 200;
        } else {
            result = {statusCode: 404, message: 'Not found'};
            statusCode = 404;
        }
    } catch(error) {
        result = {statusCode: 403, message: `Error occurred: ${error}`};
        statusCode = 403;
    } finally {
        connection.end();
    }

    res.set('Content-Type', 'application/json');
    res.set('access-control-allow-origin', '*');

    res.status(statusCode).send(result);
}

module.exports = zhishidianUserDetails;