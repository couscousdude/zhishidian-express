'use strict';
const mysql = require('promise-mysql');
const crypto = require('crypto');
const axios = require('axios');

const verifyCaptchaToken = async (token, secret) => {
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`);
    
    console.log(response);
    
    return response.data.success;
};

const genRandomString = (length) => {
    return crypto.randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0, length);
};

const sha512 = (password, salt) => {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

const saltHashPassword = (userPass) => {
    const salt = genRandomString(16);
    const passwordData = sha512(userPass, salt);

    return {
        hashedPassword: passwordData.passwordHash,
        passwordSalt: passwordData.salt
    };
};

const zhishidianUserCreate = async (req, res) => {
    const { username, firstName, lastName, password, userType, profileColor, bio, captchaToken } = req.body;
    // const { username, firstName, lastName, password, userType, profileColor, bio } = req.body;
    
    const captchaVerified = await verifyCaptchaToken(captchaToken, process.env.secret);
    
    if (captchaVerified) {
        const connection = await mysql.createConnection({
            host: process.env.mysqlEndpoint,
            user: process.env.mysqlUsr,
            password: process.env.mysqlPwd,
            database: 'zhishidian',
        });

        // const username = 'pbof';
        // const firstName = 'peter';
        // const lastName = 'bof';
        // const password = 'ooferpassword';
        // const profileColor = 'blue';
        // const userType = 'student';
        // const bio = 'u stink like poopies';

        const hashedPassword = saltHashPassword(password);

        const query = `INSERT INTO users (username, first_name, last_name, password, profile_color, user_type, salt, bio) VALUES (
            ${mysql.escape(username)}, 
            ${mysql.escape(firstName)}, 
            ${mysql.escape(lastName)}, 
            ${mysql.escape(hashedPassword.hashedPassword)}, 
            ${mysql.escape(profileColor)}, 
            ${mysql.escape(userType)}, 
            ${mysql.escape(hashedPassword.passwordSalt)},
            ${mysql.escape(bio)})`;
        // const query = `INSERT INTO users (username, first_name, last_name, \`password\`, profile_color, user_type, salt) VALUES ('sampleuser', 'Sample', 'User', '${hashedPassword.hashedPassword}', 'blue', 'student', '${hashedPassword.passwordSalt}');`


        let responseBody = '';
        let statusCode;

        try {
            const data = await connection.query(query);

            responseBody = JSON.stringify(data);

            statusCode = 201;
        } catch(error) {
            responseBody = `An error occurred: ${error}`;

            statusCode = 403;
        } finally {
            connection.end();
        }

        res.set('Content-Type', 'application/json');
        res.set('access-control-allow-origin', '*');

        res.status(statusCode).send(responseBody);
    } else {
        res.set('Content-Type', 'application/json');
        res.set('access-control-allow-origin', '*');

        res.status(409).send(JSON.stringify({statusCode: 409, message: 'Captcha failed'}));
    }
}

module.exports = zhishidianUserCreate;

// exports.handler = 

//         const response = {
//             statusCode: statusCode,
//             headers: {
//                 'Content-Type': 'application/json',
//                 'access-control-allow-origin': '*',
//             },
//             body: responseBody,
//         };

//         return response;
//     } else {
//         const response = {
//             statusCode: 409,
//             headers: {
//                 'Content-Type': 'application/json',
//                 'access-control-allow-origin': '*',
//             },
//             body: JSON.stringify({
//                 statusCode: 409,
//                 reason: 'Captcha failed'
//             })
//         }
//         return response;
//     }
// };