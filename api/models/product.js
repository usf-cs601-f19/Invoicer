const config = require('config');
const mysql = require("mysql");
const assert = require('assert')
const AssertionError = assert.AssertionError;

const connectionPool = mysql.createPool({
    host: config.get('database.host'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.dbname'),
    connectionLimit: 2
});

class Product{

    /**
     * This methods adds products to the DB
     * @param req request
     * @param res response
     * @return Returns error if product's SKU already exists for a user, else return success message
     */
    addProduct(req, res){
        try {
            assert(req.body.name,"Name is required");
            assert(req.body.label ,"Label` is required");
            assert(req.body.description,"Description is required");
            assert(req.body.rate,"Rate  is required");
            assert(req.body.unique_code,"SKU/Unique Code is required");
            assert(req.session.user.id, 'User not logged in');

            let name = req.body.name;
            let label = req.body.label;
            let description = req.body.description;
            let rate  = req.body.rate ;
            let unique_code = req.body.unique_code;

            connectionPool.query(`INSERT IGNORE into invoicing.product(name,label,description,rate ,unique_code,user_id) 
            VALUES(?,?,?,?,?,?)`, [name,label,description,rate ,unique_code,req.session.user.id], function(error, result, fields) {
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
                        message: "Product added successfully"
                    });
                }
                else{
                    res.status(422).send({
                        status: "error",
                        message: "Product with this SKU already exists"
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
     * This function returns all the products of a user
     * @param req request
     * @param res response
     * @return Returns the list of products if they exit else returns blank result with 204 statuscode.
     *         Returns error type & message in case of error
     */
    getProducts(req, res){
        try {
            assert(req.session.user.id, 'User not logged in');

            connectionPool.query(`SELECT * FROM invoicing.product where user_id = ?`, req.session.user.id,
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
                                message: ""
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

module.exports = Product;
