const db = require('../../model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Merchant = db.Merchant;
const Customer = db.Customer;
const Product = db.Product;
const Category = db.Category;
const Subcategory = db.Subcategory;
const {
    ReasonPhrases,
    StatusCodes,
    getReasonPhrase,
    getStatusCode, } = require('http-status-codes');
const {
    getmerchantlist,
    getmerchantlist_status,
    getsinglemerchantdetails,
    getsinglecustomerdetails,
    getcustomerlist,
    getcustomerlist_status,
    getcategorylist,
    getsubcategorylist,
    getmerchantproductlist,
    getproductlist,
    getmerchantproductlist_status,
    getproductlist_status,
    getcustomerorderhistorylist_order_id,
    getcustomerorderhistorylist } = require('../../services/admin');
const { success, error } = require('../../response');



// const product = require('../../model/product');

// async function addbulkproduct(req,res){
//     let merchantid = await Merchant.findAll({
//         attributes:["id"],
//         raw:true
//     });
//     merchantid.forEach
//     let id =1
//     try{for(let i=1;i<=10;i++){
//         let arr1 = [];
//         let arr2 = [];
//         let arr3 = [];
//         for(let j =1;j<=10;j++){
//             productobj = {};
//             productobj.id = id
//             productobj.hsncode = Number("1"+j);
//             productobj.productname = "1"+"Product"+j;
//             productobj.quantity = 20;
//             productobj.rate = Math.floor(Math.random()*10000);
//             productobj.discount = Math.floor(Math.random()*10);
//             let rate = productobj.rate;
//             let discount = productobj.discount;
//             productobj.sellingprice = rate-parseInt(rate*discount/100);
//             productobj.merchant_id = i;
//             productobj.category_id = 1;
//             arr1.push(productobj);
//             id++;
//         }
//         await Product.bulkCreate(arr1);
//         for(let j =1;j<=10;j++){
//             productobj = {};
//             productobj.id = id
//             productobj.hsncode = Number("2"+j);
//             productobj.productname = "2"+"Product"+j;
//             productobj.quantity = 20;
//             productobj.rate = Math.floor(Math.random()*10000);
//             productobj.discount = Math.floor(Math.random()*10);
//             let rate = productobj.rate;
//             let discount = productobj.discount;
//             productobj.sellingprice = rate-parseInt(rate*discount/100);
//             productobj.merchant_id = i;
//             productobj.category_id = 2;
//             arr2.push(productobj);
//             id++;
//         }
//         await Product.bulkCreate(arr2);
//         for(let j =1;j<=10;j++){
//             productobj = {};
//             productobj.id = id
//             productobj.hsncode = Number("3"+j);
//             productobj.productname = "3"+"Product"+j;
//             productobj.quantity = 20;
//             productobj.rate = Math.floor(Math.random()*10000);
//             productobj.discount = Math.floor(Math.random()*10);
//             let rate = productobj.rate;
//             let discount = productobj.discount;
//             productobj.sellingprice = rate-parseInt(rate*discount/100);
//             productobj.merchant_id = i;
//             productobj.category_id = 3;
//             arr3.push(productobj);
//             id++;
//         }
//         await Product.bulkCreate(arr3);
//     }
//     res.json({
//         message:'All the products has been added'
//     })}catch(err){
//         console.log(err);
//         res.json({
//             error:err.message
//         })
//     }
// }



async function test(req,res){

}
async function approvemerchant(req, res) {
    try {
        const { email } = req.body
        let data = await Merchant.findOne({
            where: {
                email: email
            },
            raw: true
        });
        if (data != null) {
            if (data.status == 0) {
                const token = jwt.sign({ merchant_email: email, type: 'setpassword' }, 'secret_key');
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'deepak.gupta@appventurez.com',
                        pass: "zjwiljismbsmbmin"
                    }
                });
                const mailOptions = {
                    from: "deepak89484561@gmail.com",
                    to: email,
                    subject: 'Approval mail',
                    text: token
                }
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log(error);
                        res.status(502).json({
                            status: ReasonPhrases.BAD_GATEWAY,
                            "status code": StatusCodes.BAD_GATEWAY,
                            error: true,
                            "error message": error.message,
                            response: {}
                        });
                    } else {
                        console.log(info);
                        res.status(200).json({
                            status: ReasonPhrases.OK,
                            "status code": StatusCodes.OK,
                            error: null,
                            response: {
                                message: "Token sent to registered email to set password",
                                token: token
                            }
                        });
                    }
                });
            }
            else if (data.status == -1) {
                res.json({
                    message: 'you are blocked'
                })
            } else {
                res.json({
                    message: 'Already verified'

                })
            }
        } else {
            console.log('merchant does not exists');
            res.json({
                message: 'merchant does not exists'
            })
        }
        console.log(data);
    } catch (err) {
        console.log(err);
    }
}

async function showmerchantdetails(req, res) {
    try {
        if (req.query.merchant_id) {
            let merchantdetails = await getsinglemerchantdetails({ merchant_id: req.query.merchant_id });
            if (merchantdetails == null) {
                error(req, res, 404, "Merchant not found")
            } else {
                success(req, res, 200, "Merchantdetails", merchantdetails);
            }
        }
        else {
            if (req.query.status) {
                let merchantlist = await getmerchantlist_status({ status: req.query.status });
                if (merchantlist.length == 0) {
                    error(req, res, 404, "No merchant found");
                }
                else {
                    success(req, res, 200, `No. of ${(req.query.status == 1) ? "active" : "blocked"} merchants = ${merchantlist.length}`, merchantlist);
                }
            } else {
                let merchantlist = await getmerchantlist();
                if (merchantlist.length == 0) {
                    error(req, res, 404, "No merchant found");
                }
                else {
                    success(req, res, 200, `No. of merchants = ${merchantlist.length}`, merchantlist);
                }
            }

        }
    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }

}

async function showcustomerdetails(req, res) {
    try {
        if (req.query.customer_id) {
            let customerdetails = await getsinglecustomerdetails({ customer_id: req.query.customer_id });
            if (customerdetails == null) {
                error(req, res, 404, "Customer not found")
            } else {
                success(req, res, 200, "Customerdetails", customerdetails);
            }
        }
        else {
            if (req.query.status) {
                let customerlist = await getcustomerlist_status({ status: +req.query.status });
                if (customerlist.length == 0) {
                    error(req, res, 404, "No customer found");
                }
                else {
                    success(req, res, 200, `No. of ${(req.query.status == 1) ? "active" : "blocked"} customers = ${customerlist.length}`, customerlist);
                }
            } else {
                let customerlist = await getcustomerlist();
                if (customerlist.length == 0) {
                    error(req, res, 404, "No customer found");
                }
                else {
                    success(req, res, 200, `No. of customers = ${customerlist.length}`, customerlist);
                }
            }
        }
    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function showcategories(req, res) {
    let categorylist = await getcategorylist();
    if (categorylist.length == 0) {
        error(req, res, 404, "No category found");
    } else {
        success(req, res, 200, "Categorylist", categorylist);
    }
}

async function showsubcategories(req, res) {
    let subcategorylist = await getsubcategorylist();
    if (subcategorylist.length == 0) {
        error(req, res, 404, "No subcategory found");
    } else {
        success(req, res, 200, "Subategorylist", subcategorylist);
    }
}

async function showinventory(req, res) {
    try {
        if (req.query.merchant_id) {
            if (req.query.status) {
                let merchantproductlist_status = await getmerchantproductlist_status({ merchant_id: req.query.merchant_id, status: req.query.status });
                if (merchantproductlist_status.length == 0) {
                    error(req, res, 404, "No product found")
                } else {
                    success(req, res, 200, "Productlist of the merchant", merchantproductlist_status);
                }
            } else {
                let merchantproductlist = await getmerchantproductlist({ merchant_id: req.query.merchant_id });
                if (merchantproductlist.length == 0) {
                    error(req, res, 404, "No product found")
                } else {
                    success(req, res, 200, "Productlist of the merchant", merchantproductlist);
                }
            }

        } else {
            if (req.query.status) {
                let productlist_status =await getproductlist_status({ status: req.query.status });
                if (productlist_status.length == 0) {
                    error(req, res, 404, "No Product found");
                } else {
                    success(req, res, 200, "Productlist", productlist_status);
                }
            } else {
                let productlist =await getproductlist();
                if (productlist.length == 0) {
                    error(req, res, 404, "No Product found");
                } else {
                    success(req, res, 200, "Productlist", productlist);
                }
            }

        }
    } catch (err) {
        error(req,res,500,"Internal Servor Error",err.message);
    }


}

async function statusupdate(req, res) {
    try {
        const category = req.query.category;
        const status = req.query.status

        if (category == 'customer') {
            await Customer.update({
                status: +status
            },
                {
                    where: {
                        id: req.body.id
                    }
                });
            res.json({
                message: 'Status Updated Successful'
            })
        } else if (category == 'merchant') {
            await Merchant.update({
                status: status,
            },
                {
                    where: {
                        id: req.body.id
                    }
                });
            await Product.update({
                status: status
            }, {
                where: {
                    merchant_id: req.body.id
                }
            })
            res.json({
                message: 'Status Updated Successful'
            })
        } else if (category == 'product') {
            await Product.update({
                status: +status
            }, {
                where: {
                    id: req.body.id
                }
            });
            res.json({
                message: 'Status Updated Successful'
            })
        }
    } catch (err) {
        console.log(err);
    }
}

async function show_customer_orderhistory(req, res) {
    try {
        // let orderhistorylist = await getcustomerorderhistorylist({customer:req.query.customer_id,order_id:req.query.order_id});
        if(req.query.order_id){
            // console.log('showorderhistory');
        let [ordersummary,orderhistorylist_order_id] = await getcustomerorderhistorylist_order_id({customer_id:req.query.customer_id,order_id:req.query.order_id});
        // console.log('I am sorry babu')
        if(orderhistorylist_order_id.length ==0){
            error(req,res,404,"No product found with this order_id");
        }else{
            success(req,res,200,`No. of Products ordered =${orderhistorylist_order_id.length}`,[ordersummary,orderhistorylist_order_id]);
        }
    }else{
        let orderhistorylist_till_now = await getcustomerorderhistorylist({customer_id:req.query.customer_id});
        if(orderhistorylist_till_now.length == 0){
            error(req,res,404,"No order placed till now");
        }else{
            success(req,res,200,`No. of Products ordered till now =${orderhistorylist_till_now.length}`,orderhistorylist_till_now);
        }
    }

    } catch (err) {
        error(req,res,500,"Internal Server Error",err.message);
    }
}
module.exports = {
    approvemerchant,
    showmerchantdetails,
    showcustomerdetails,
    showcategories,
    showsubcategories,
    statusupdate,
    showinventory,
    show_customer_orderhistory,
    // test
    // addbulkproduct
}