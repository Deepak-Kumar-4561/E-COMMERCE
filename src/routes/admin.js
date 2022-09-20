const adminroute = require('express').Router();

const {validator} = require('../utilis');
const {
    approvemerchant_schema,
    merchant_schema,
    customer_schema,
    block_schema,
    customer_orderhisttory_schema } = require('../validation/admin')


const {
    approvemerchant,
    statusupdate,
    showmerchantdetails,
    showcustomerdetails,
    showinventory,
    show_customer_orderhistory,
    test
    // addbulkproduct
 } = require('../controller/admin');
// const {  } = require('../validation/admin');

const { adminauthorization } = require('../auth')



// adminroute.post('/login',loginvalidation,login);


adminroute.get('/approvemerchant', adminauthorization,validator(approvemerchant_schema,"body"), approvemerchant);
adminroute.get('/showmerchantdetails', adminauthorization,validator(merchant_schema,"query"), showmerchantdetails);
adminroute.get('/showcustomerdetails',adminauthorization,validator(customer_schema,"query"),showcustomerdetails)
adminroute.patch('/block',adminauthorization,  validator(block_schema),statusupdate);
adminroute.get('/showinventory',adminauthorization,validator(merchant_schema,"query"),showinventory);
// adminroute.post('/addbulkproduct',addbulkproduct);
// adminroute.all('/all',test)
adminroute.get('/showcustomerorderhistory',adminauthorization,validator(customer_orderhisttory_schema,"query"),show_customer_orderhistory)

module.exports = adminroute;