const config = require('config');
const mysql = require("mysql");
const assert = require('assert')
const AssertionError = assert.AssertionError;
const {compareSync, hashSync} = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "BN93RYK3HTYOCPG0GBS8";

const connectionPool = mysql.createPool({
    host: config.get('database.host'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.dbname'),
    connectionLimit: 2
});

class User{
    /**
     * It stores a new user data in the DB
     * @param req request
     * @param res response
     */
    addUser(req, res){

        try {
            assert(req.body.name, 'Name is required');
            assert(req.body.mobile, 'Mobile is required');
            assert(req.body.password, 'Password is required');
            assert(req.body.confirmPassword, 'Confirm Password is required');
            assert(req.body.companyName, 'Company Name is required');
            assert(req.body.type_id, 'User Type is required');

            assert.strictEqual(req.body.password, req.body.confirmPassword,"Password and Confirm Password don't match");

            let name = req.body.name;
            let mobile = req.body.mobile;
            let password = req.body.password;
            let companyName = req.body.companyName;
            let company_website = req.body.company_website;
            let type_id = req.body.type_id;
            let email = req.body.hasOwnProperty('email') ? req.body.email : "";

            const hashedPassword = hashSync(password, 10);

            connectionPool.query(`INSERT IGNORE into invoicing.user(name, mobile, password, company_name, 
       company_website, email,type_id) VALUES(?,?,?,?,?,?,?)`, [
           name, mobile, hashedPassword, companyName, company_website, email,type_id], function(error, result, fields) {
                if (error) {
                    res.status(500).send({
                        status: "error",
                        code: error.code,
                        message: error.sqlMessage
                    });
                } else if(result.insertId > 0){

                    res.status(200).send({
                        status: "success",
                        data: "",
                        message: "User added successfully"
                    });
                }
                else{
                    res.status(500).send({
                        status: "error",
                        message: "A user with same mobile number already exists"
                    });
                }
            });
        }
        catch (e) {
            if(e instanceof AssertionError){
                console.log(req.url,"-",__function,"-","AssertionError : ",e.message);
                res.status(500).send({
                    status: "AssertionError",
                    message: e.message
                });
            }
            else{
                console.log(req.url,"-",__function,"-","Error : ",e.message);
                res.status(500).send({
                    status: "error",
                    message: e.message
                });
            }
        }
    }

    /**
     * This function gives user data for authentic users
     * @param req request
     * @param res response
     * @return Returns the user data if authentic else, returns error type & message in case of error
     */
    loginUser(req, res){
        try {

            assert(req.body.username, 'Username is required');
            assert(req.body.password, 'Password is required');

            let username = req.body.username;
            let password = req.body.password;

            connectionPool.query(`SELECT id,password FROM invoicing.user where mobile = ?`, username,
                function(error, result, fields) {
                    if (error) {
                        res.status(500).send({
                            status: "error",
                            code: error.code,
                            message: error.sqlMessage
                        });
                    } else{
                        if(result.length>0){

                            // Matching Password
                            if(compareSync(password, result[0].password)) {
                                // Passwords matched

                                // create a JWT token
                                const token = jwt.sign({ id: result.id }, JWT_SECRET, {
                                    expiresIn: 86400 // expires in 24 hours
                                });

                                connectionPool.query(`UPDATE invoicing.user SET auth_token = ? WHERE id = ?`, [token,result[0].id], function(error2, result2, fields2) {
                                    if (error) {
                                        res.status(500).send({
                                            status: "error",
                                            code: error.code,
                                            message: error.sqlMessage
                                        })
                                    }
                                    else {
                                        res.status(200).send({
                                            status: "success",
                                            data: token,
                                            message: "Login successful"
                                        });
                                    }
                                })
                            } else {
                                res.status(401).send({
                                    status: "error",
                                    message: "Incorrect Password"
                                });
                            }
                        }
                        else{
                            res.status(422).send({
                                status: "error",
                                message: "Username not registered"
                            });
                        }
                    }
                });
        }
        catch (e) {
            if(e instanceof AssertionError){
                console.log(req.url,"-",__function,"-","AssertionError : ",e.message);
                res.status(500).send({
                    status: "AssertionError",
                    message: e.message
                });
            }
            else{
                console.log(req.url,"-",__function,"-","Error : ",e.message);
                res.status(500).send({
                    status: "error",
                    message: e.message
                });
            }
        }
    }

    /**
     * This function signs the user out of the application. It deletes the session and other data of user if stored
     * @param req request
     * @param res response
     * @return Returns logout message
     */
    logoutUser(req, res) {
        connectionPool.query(`UPDATE invoicing.user SET auth_token = ? WHERE id = ?`, ["",req.user_id], function(error2, result2, fields2) {
            if (error2) {
                res.status(500).send({
                    status: "error",
                    code: error2.code,
                    message: error2.sqlMessage
                })
            }
            else {
                res.status(200).send({
                    status: "success",
                    message: "Logged out successfully"
                });
            }
        })
    }
    /**
     * This function check if the auth_token is authentic or not
     * @param req request
     * @param res response
     * @return Returns logout message
     */
    authenticateToken(req, res, next) {
        const token = req.headers['authorization'];

        connectionPool.query(`SELECT id FROM invoicing.user where auth_token = ?;`, token, function(error, result, fields) {
            if (error) {
                res.status(500).send({
                    status: "error",
                    code: error.code,
                    message: error.sqlMessage
                });
            } else if(result.length > 0){
                req.user_id = result[0].id;
                next();
            }
            else {
                res.status(401).send({
                    status: "error",
                    err_code: "UNAUTHORIZED",
                    message: "User is not logged in"
                });
            }
        });
    }
}

module.exports = User;
