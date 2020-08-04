const mysql = require('promise-mysql');

const zhishidianCreatePost = async (req, res) => {
    const connection = await mysql.createConnection({
        host: process.env.mysqlEndpoint,
        user: process.env.mysqlUsr,
        password: process.env.mysqlPwd,
        database: 'zhishidian',
    });

    const { author, title, content, user_id } = req.body;

    const query = `INSERT INTO posts (title, author, content, user_id) VALUES (
     ${mysql.escape(title)},
     ${mysql.escape(author)},
     ${mysql.escape(content)},
     ${mysql.escape(user_id)})`;

    let responseBody;
    let statusCode;

    try {
        const data = await connection.query(query);

        responseBody = JSON.stringify(data);

        statusCode = 201;
    } catch(error) {
        responseBody = {statusCode: 403, message: `An error occurred: ${error}`}

        statusCode = 403
    } finally {
        connection.end();
    }
    res.set('Content-Type', 'application/json');
    res.set('access-control-allow-origin', '*');

    res.status(statusCode).send(responseBody);
}

module.exports = zhishidianCreatePost;