const express = require('express');
const router = express.Router();
const User = require('./../models/user')
const bcrypt = require('bcrypt');
const config = require('config');
const mysql = require("mysql");
const assert = require('assert')

const connectionPool = mysql.createPool({
    host: config.get('database.host'),
    user: config.get('database.user'),
    password: config.get('database.password'),
    database: config.get('database.dbname'),
    connectionLimit: 2
});

router.get('/login', function(req, res) {
    res.send('login GET');
});

router.post('/register', function(req, res) {
    try {
        assert(req.body.name, 'Name is required');
        assert(req.body.mobile, 'Mobile is required');
        assert(req.body.password, 'Password is required');
        assert(req.body.confirmPassword, 'Confirm Password is required');
        assert(req.body.email, 'Email is required');
        assert(req.body.company_name, 'Company Name is required');

        let name = req.body.name;
        let mobile = req.body.mobile;
        let password = req.body.password;
        let email = req.body.email;
        let company_name = req.body.company_name;
        let company_website = req.body.company_website;

        let hashPassword = bcrypt.hashSync(password, 10);

        connectionPool.query(`INSERT into invoicing.user(name, mobile, password, company_name, 
       company_website, email) VALUES(?,?,?,?,?,?)`, [name, mobile, hashPassword, company_name, company_website, email], function(error, result, fields) {

            console.log("error, result, fields",error, result, fields);
            if (error) {
                res.status(500).send({
                    status: "error",
                    message: error.sqlMessage
                });
            } else{
                res.status(200).send({
                    status: "success",
                    data: result.insertId,
                    message: "User added successfully"
                });
            }
        });
    }
    catch (e) {
        console.log("Error : ",req.url,e.message);
        res.status(500).send({
            status: "error",
            message: e.message
        });
    }
});

router.post('/login', function(req, res) {
    res.send('login POST');
    console.log("req.body",req.body)
});

module.exports = router;
