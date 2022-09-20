const db = require('./model');
const { sequelize } = require('./model');
const { Sequelize } = require('sequelize');
const paypal = require('paypal-rest-sdk');
const Customer = db.Customer;
const Otp = db.Otp;
const joi = require('joi');
const { 
    ReasonPhrases, 
    StatusCodes,
    getReasonPhrase,
    getStatusCode, } = require('http-status-codes');

const {success,error} = require('../src/response');
function otpgenerator (){
    let n = 4;
    const characters = "1234567890";
    const charCount = characters.length;
    let newStr = "";
    for (let i = 0; i < n; i++) {
      newStr += characters.charAt(Math.floor(Math.random() * charCount));
    }
    return newStr;
}


async function saveotp(req, res) {
    otptobesent = ""
    try {
        let data = await Customer.findOne({
            where: {
                email: req.body.email
            }
        });
        if (data != null) {
            console.log(`${req.body.email} already exists`);
            return 0;
        } else {
            let data1 = await Otp.findOne({
                where: {
                    email: req.body.email
                }
            });
            if (data1 != null) {
                let data2 = await Otp.findOne({
                    where: {
                        [Sequelize.Op.and]: [
                            { email: req.body.email },
                            sequelize.where(sequelize.fn('timestampdiff',
                                sequelize.literal('minute'),
                                sequelize.col('updatedAt'),
                                sequelize.literal('CURRENT_TIMESTAMP')
                            ),
                                {
                                    [Sequelize.Op.lt]: 5
                                })
                        ]
                    }
                });
                if (data2 != null) {
                    console.log(data2.otp);
                    otptobesent+= data2.otp;
                    return otptobesent
                } else {
                    otptobesent += otpgenerator();
                    let data3 = await Otp.update(
                        {
                            otp: otptobesent
                        },
                        {
                            where: {
                                email: req.body.email
                            }
                        }
                    );
                    return otptobesent;
                }
            } else {
                otptobesent += otpgenerator();
                let insertedotp = await Otp.create({
                    email: req.body.email,
                    otp: otptobesent
                });
                return otptobesent
            }
        }
    } catch (err) {
        console.log(`error occured while generating otp ${err}`);
        res.status(408).json({
            status:getReasonPhrase(408),
            "status code":408,
            error:true,
            "error message":"Request Timeout",
            response:{}
        });
    }
}


const validator = (schema,property)=>{
    return (req,res,next)=>{
        const {error} = schema.validate(req[property]);
        const valid = error ==null;
        if(valid){
            next();
        }   else{
            const {details}  =error;
            const message = details.map(i=>i.message).join(",");
            res.json({
                status:getReasonPhrase(400),
                "status code":400,
                error:true,
                "error message":message,
                response:{}
            })
        }
    }
}

const paypalpayment = (req,res)=>{


    paypal.configure({
        "mode":"sandbox",
        "client_id":"ARTT3rmqXU-xo9rJmIm5149sPYfKHPvONEOjyFCBGesR9md1nZkt9Y_H-WYDSmZ51kT-v1uSgJ6LVZnk",
        "client_secret":"EMctQ8J0xqI6HJL7VxC0hqfTuaUAW2OrXl1bDxscS7t8a8eKcIZyqRRyHpAqjb_4AWSW3lfGqvCOZ0DL"
    });
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:7788/customer/success",
            "cancel_url": "http://localhost:7788/customer/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            success(req,res,200,"Initiate payment",payment);
        }
    });
}

module.exports = {
    saveotp,validator,
    paypalpayment
}