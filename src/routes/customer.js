console.log("customerroutes")
const customerroute = require('express').Router();


const { customerauthorization } = require('../auth');
const paypal = require('paypal-rest-sdk');

const {
    sendotp,
    verifyotp,
    register_customer,
    addaddress, showproduct,
    addtocart,
    searchproducts,
    searchproductby,
    showcart,
    placeorder,
    initiate_payment,
    showaddresses,
    updatecart,
    deleteproductfromcart,
    show_orderhistory, 
    razorpayorderID,
    verify_signature,
    ordercheck} = require('../controller/customer');
const { validator, paypalpayment } = require('../utilis');
const {
    send_otp_schema,
    customer_register_schema,
    customer_address_schema,
    update_cart_schema,
    delete_product_schema,
    add_to_cart_schema, 
    verify_otp_schema,
    place_order_schema} = require('../validation/customer');


customerroute.post('/sendotp', validator(send_otp_schema,"body"),sendotp);

customerroute.post('/verifyotp', validator(verify_otp_schema,"body"),verifyotp);

customerroute.post('/registration', validator(customer_register_schema,"body"), register_customer);
show_orderhistory
customerroute.post('/addaddress', customerauthorization, validator(customer_address_schema,"body"), addaddress);

customerroute.get('/showproducts', customerauthorization, showproduct);

customerroute.post('/addtocart', customerauthorization, validator(add_to_cart_schema,"body") ,addtocart);

customerroute.get('/showcart', customerauthorization, showcart);

customerroute.patch('/updatecartproduct', customerauthorization, validator(update_cart_schema,"body"), updatecart);


customerroute.delete('/deleteproductfromcart', customerauthorization, validator(delete_product_schema,"body"), deleteproductfromcart)

customerroute.get('/showaddresses', customerauthorization, showaddresses)

customerroute.get('/intiatepayment',customerauthorization,paypalpayment);

customerroute.get('/success',(req,res)=>{
    const  paymentId = req.query.paymentId;
    const PayerID = req.query.PayerID;
    const execute_payment_json = {
        "payer_id": PayerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send(payment);
        }
    });
})

// customerroute.post('/razorpayorderID',customerauthorization,);

// customerroute.post('/generateorderID',razorpayorderID);

customerroute.post('/placeorder', customerauthorization,ordercheck,verify_signature,placeorder)

customerroute.get('/searchproducts', customerauthorization, searchproducts);

customerroute.get('/searchproductby', customerauthorization, searchproductby);

customerroute.get('/showorderhistory',customerauthorization,show_orderhistory)



module.exports = customerroute;