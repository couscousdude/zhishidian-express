'use strict'
const mysql = require('promise-mysql');
const crypto = require('crypto');

const sha512 = (password, salt) => {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

const zhishidianUserAuthenticate = async (req, res) => {
    const { username, password } = req.query;

    const connection = await mysql.createConnection({
        host: process.env.mysqlEndpoint,
        user: process.env.mysqlUsr,
        password: process.env.mysqlPwd,
        database: 'zhishidian',
    });

    let result;
    let statusCode;
    let user_id;

    try {
        // retrieve the salt from the database
        const getSaltQuery = `SELECT salt FROM users WHERE username=${mysql.escape(username)}`;
        let salt = await connection.query(getSaltQuery);
        
        if (salt.length) {
            // hash and salt the password using the salt
            // then match it against the database to check if it's correct
            const hashedPassword = sha512(password, salt[0].salt).passwordHash;
    
            const checkCredentialQuery = `SELECT username, user_id FROM users WHERE \`username\`=${mysql.escape(username)} AND \`password\`=${mysql.escape(hashedPassword)}`;
            let authenticatedUser = (await connection.query(checkCredentialQuery));
    
            if (authenticatedUser.length) {
                statusCode = 200;
                user_id = authenticatedUser[0].user_id;
            } else {
                statusCode = 401;
                result = JSON.stringify([{statusCode: statusCode, error: 'Username or password are incorrect'}]);
            }
        } else {
            statusCode = 401;
                result = JSON.stringify([{statusCode: statusCode, error: 'Username or password are incorrect'}]);
        }
    } catch(error) {
        result = {statusCode: 403, message: `Error occurred: ${error}`};
        statusCode = 403;
    } finally {
        connection.end();
    }
    
    res.set('Content-Type', 'application/json');
    res.set('access-control-allow-origin', '*');

    if (statusCode === 200) {
        res.status(statusCode).send(JSON.stringify([{statusCode: statusCode, user_id: user_id}]));
    } else if (statusCode === 401) {
        res.set('WWW-Authenticate', 'Basic');
        res.status(statusCode).send(JSON.stringify(result));
    } else {
        res.status(statusCode).send(JSON.stringify(result));
    }
}

module.exports = zhishidianUserAuthenticate;