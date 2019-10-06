const config = require('config');
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const assert = require('assert')
const AssertionError = assert.AssertionError;

const connectionPool = mysql.createPool({
    host: config.get('database.host'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.dbname'),
    connectionLimit: 2
});

class User{

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

            let hashPassword = bcrypt.hashSync(password, 10);

            connectionPool.query(`INSERT IGNORE into invoicing.user(name, mobile, password, company_name, 
       company_website, email,type_id) VALUES(?,?,?,?,?,?,?)`, [
           name, mobile, hashPassword, company_name, company_website, email,type_id], function(error, result, fields) {
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

    loginUser(req, res){
        try {
            assert(req.body.mobile, 'Username is required');
            assert(req.body.password, 'Password is required');

            let mobile = req.body.mobile;
            let password = req.body.password;

            connectionPool.query(`SELECT * FROM invoicing.user where mobile = ?`, [mobile],
                function(error, result, fields) {
                    if (error) {
                        res.status(500).send({
                            status: "error",
                            code: [error.errno],
                            message: error.sqlMessage
                        });
                    } else{
                        if(result.length>0){
                            if(bcrypt.compareSync(password, result[0].password)) {
                                // Passwords match
                                result = result[0];
                                delete result['password'];
                                delete result['created_on'];
                                delete result['updated_on'];

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
                                message: "No account found"
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
}

module.exports = User;
