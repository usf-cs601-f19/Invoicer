const express = require('express');
const router = express.Router();
const customer = require('./../models/customer')
const Customer = new customer();

router.get('/all', function(req, res) {
    Customer.getCustomers(req,res);
});

router.get('/:id', function(req, res) {
    Customer.getCustomer(req,res);
});

router.post('/new', function(req, res) {
    Customer.addCustomer(req,res);
});

module.exports = router;
