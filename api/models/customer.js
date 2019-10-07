const config = require('config');
const mysql = require("mysql");
const assert = require('assert');
const AssertionError = assert.AssertionError;

const connectionPool = mysql.createPool({
    host: config.get('database.host'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.dbname'),
    connectionLimit: 2
});

class Customer{

    /**
     * This methods inserts a customer data to the DB
     * @param req request
     * @param res response
     * @return Returns error if error inserting customer data, else return success message
     */
    addCustomer(req, res){
        try {
            assert(req.body.name, 'Name is required');
            assert(req.body.mobile, 'Mobile is required');
            assert(req.body.email, 'Email is required');
            assert(req.body.company_name, 'Company Name is required');
            assert(req.body.type_id, 'User Type is required');

            let name = req.body.name;
            let mobile = req.body.mobile;
            let email = req.body.email;
            let company_name = req.body.company_name;
            let company_website = req.body.company_website;
            let type_id = req.body.type_id;

            connectionPool.query(`INSERT IGNORE into invoicing.customer(name, mobile, company_name, 
       company_website, email,type_id,user_id) VALUES(?,?,?,?,?,?,?)`, [
                name, mobile, company_name, company_website, email,type_id, req.session.user.id ], function(error, result, fields) {
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
                        message: "Customer added successfully"
                    });
                }
                else{
                    res.status(422).send({
                        status: "error",
                        message: "Customer already exists"
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
     * This function returns all the customers added by a user
     * @param req request
     * @param res response
     * @return Returns the list of customers if they exist else returns blank result with 204 statuscode.
     *         Returns error type & message in case of error
     */
    getCustomers(req, res){
        try {

            connectionPool.query(`SELECT id customer_id,name, mobile, company_name, company_website, email,type_id FROM invoicing.customer where user_id = ?`, req.session.user.id,
                function(error, result, fields) {
                    if (error) {
                        res.status(500).send({
                            status: "error",
                            code: [error.errno],
                            message: error.sqlMessage
                        });
                    } else{
                        if(result.length>0){

                            res.status(200).send({
                                status: "success",
                                data: result,
                                length: result.length
                            });
                        }
                        else{
                            res.status(204).send();
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
     * This function returns a single customer data as per the customer id
     * @param req request
     * @param res response
     * @return Returns a customer data if it exist. Returns error in case of error
     */
    getCustomer(req, res){
        try {
            assert(req.params.id, 'Customer Id not provided');
            assert(req.session.user.id, 'User not logged in');

            connectionPool.query(`SELECT * FROM invoicing.customer where id = ? and user_id = ?`,
                [req.params.id, req.session.user.id], function(error, result, fields) {
                    if (error) {
                        res.status(500).send({
                            status: "error",
                            code: [error.errno],
                            message: error.sqlMessage
                        });
                    } else{
                        if(result.length>0){
                            res.status(200).send({
                                status: "success",
                                data: result[0],
                                length: result.length
                            });
                        }
                        else{
                            res.status(204).send();
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

module.exports = Customer;
