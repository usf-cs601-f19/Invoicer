const config = require('config');
const mysql = require("mysql");
const assert = require('assert')
const AssertionError = assert.AssertionError;
const {compareSync, hashSync} = require('bcrypt');

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
            assert(req.body.email, 'Email is required');
            assert(req.body.company_name, 'Company Name is required');
            assert(req.body.type_id, 'User Type is required');

            assert.strictEqual(req.body.password, req.body.confirmPassword,"Password and Confirm Password don't match");

            let name = req.body.name;
            let mobile = req.body.mobile;
            let password = req.body.password;
            let email = req.body.email;
            let company_name = req.body.company_name;
            let company_website = req.body.company_website;
            let type_id = req.body.type_id;

            let hashedPassword = hashSync(password, 10);

            connectionPool.query(`INSERT IGNORE into invoicing.user(name, mobile, password, company_name, 
       company_website, email,type_id) VALUES(?,?,?,?,?,?,?)`, [
           name, mobile, hashedPassword, company_name, company_website, email,type_id], function(error, result, fields) {
                if (error) {
                    res.status(500).send({
                        status: "error",
                        code: [error.errno],
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
                    res.status(422).send({
                        status: "error",
                        message: "User already exists"
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
            assert(req.body.mobile, 'Username is required');
            assert(req.body.password, 'Password is required');

            let mobile = req.body.mobile;
            let password = req.body.password;

            connectionPool.query(`SELECT * FROM invoicing.user where mobile = ?`, mobile,
                function(error, result, fields) {
                    if (error) {
                        res.status(500).send({
                            status: "error",
                            code: [error.errno],
                            message: error.sqlMessage
                        });
                    } else{
                        if(result.length>0){
                            if(compareSync(password, result[0].password)) {
                                // Passwords match
                                result = result[0];

                                delete result['created_on'];
                                delete result['updated_on'];

                                req.session.user = result;
                                console.log("Session created successfully");

                                delete result['id'];
                                delete result['password'];

                                res.status(200).send({
                                    status: "success",
                                    data: result,
                                    message: ""
                                });

                            } else {
                                res.status(401).send({
                                    status: "error",
                                    message: "Incorrect Password"
                                });
                            }
                        }
                        else{
                            res.status(500).send({
                                status: "error",
                                message: "User not found"
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
     * This function logs the user out of the application. It deletes the session and other data of user if stored
     * @param req request
     * @param res response
     * @return Returns logout message
     */
    logoutUser(req, res) {
        delete req.session['user'];
        res.status(200).send({
            status: "success",
            message: "Logged out successfully"
        });
    }
}

module.exports = User;
