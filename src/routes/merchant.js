console.log("merchantroutes")

const merchantroute = require('express').Router();

const {
    merchantregister, 
    setpassword,
    login,
    createcategory,
    createsubcategory,
    addproduct, 
    showproductby, 
    showorder,
    showproducts_purchased_by_customer,
    updateProductdetails,    
    deleteproduct,
    showcustomers_bought_A_product} = require("../controller/merchant");

const{merchantauthorization} = require('../auth')

const {
    merchant_register_schema,
    password_schema,
    category_schema,
    subcategory_schema,
    add_product_schema, 
    update_product_schema,
    delete_product_schema,
    search_customer_schema,
    search_product_schema   } = require("../validation/merchant");

const { login_schema } = require('../validation/customer');
const {validator} =require('../utilis');
// const category = require('../model/category');


merchantroute.post('/register',validator(merchant_register_schema,"body"),merchantregister);
merchantroute.put('/setpassword',validator(password_schema,"body"),setpassword);
merchantroute.post('/login',validator(login_schema,"body"),login);
merchantroute.post('/addcategory',merchantauthorization,validator(category_schema,"body"),createcategory)
merchantroute.post('/addsubcategory',merchantauthorization,validator(subcategory_schema,"body"),createsubcategory)

merchantroute.post('/addproduct',merchantauthorization,validator(add_product_schema,"body"),addproduct);
merchantroute.get('/showproduct',merchantauthorization,showproductby);
merchantroute.get('/showorders',merchantauthorization,showorder);
merchantroute.get('/showproductspurchasebycustomer',merchantauthorization,validator(search_customer_schema,'query'),showproducts_purchased_by_customer);
merchantroute.get('/showcustomersboughtaproduct',merchantauthorization,validator(search_product_schema,'query'),showcustomers_bought_A_product)
merchantroute.patch('/updateproduct',merchantauthorization,validator(update_product_schema,"body"),updateProductdetails)
merchantroute.delete('/deleteproduct',merchantauthorization,validator(delete_product_schema,"body"),deleteproduct);

module.exports = merchantroute;