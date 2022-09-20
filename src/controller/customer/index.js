const db = require('../../model');
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const stripe = require('stripe')("sk_test_51LezcFSD24HKNOPXkFMU6WjdGweGbsiWgXHu2kfw2LgwqLJXep7CodQwBM4ZhAywXhHNJDGZltVMUCX9Q5aKTrR500wSd25SIa");
const { saveotp } = require('../../utilis')
const bcrypt = require('bcrypt');
const razorpay = require('razorpay');
const crypto = require("crypto");
const {
    ReasonPhrases,
    StatusCodes,
    getReasonPhrase,
    getStatusCode, } = require('http-status-codes');
const { success, error } = require('../../response');
const {
    getorderhistorylist_order_id,
    getorderhistorylist,
    getcustomerdetails } = require('../../services/customer');
// const { reduce } = require('lodash');
const sequelize = db.sequelize;
const Customer = db.Customer;
const Otp = db.Otp;
const Customeraddress = db.Customeraddress;
const Product = db.Product;
const Merchant = db.Merchant;
const Category = db.Category;
const Subcategory = db.Subcategory;
const Cart = db.Cart;
const Order = db.Order;
const Orderhistory = db.Orderhistory;
const Payment = db.Payment


async function sendotp(req, res) {
    try {
        let otp = await (saveotp(req, res));
        if (otp) {
            var transporter = nodemailer.createTransport({
                // host: 'smtp.gmail.com',
                // port: 465,
                // secure: true,
                service: "gmail",
                auth: {
                    user: 'deepak.gupta@appventurez.com',
                    pass: 'zjwiljismbsmbmin'
                }
            });
            var mailOptions = {
                from: 'deepak.gupta@appventurez.com',
                to: req.body.email,
                subject: 'OTP for verification',
                text: otp
            };

            transporter.sendMail(mailOptions, async function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(502).json({
                        status: ReasonPhrases.BAD_GATEWAY,
                        "status code": StatusCodes.BAD_GATEWAY,
                        error: true,
                        "error message": error.message,
                        response: {}
                    })
                } else {
                    console.log('Email sent: ' + info.response);
                    let token = jwt.sign({ email: req.body.email }, 'secret_key', {
                        expiresIn: "600s"
                    });
                    res.status(200).json({
                        status: ReasonPhrases.OK,
                        "status code": StatusCodes.OK,
                        error: null,
                        response: {
                            message: "OTP sent",
                            token: token
                        }

                    });

                }
            });
        } else {
            res.status(409).json({
                status: ReasonPhrases.CONFLICT,
                "status code": StatusCodes.CONFLICT,
                error: true,
                "error message": `Email already exists`,
                response: {}
            })
        }
    } catch (err) {
        // res.status(500).json({
        //     status:getReasonPhrase('Internal Server Error'),
        //     "status code":getStatusCode('Internal Server Error'),
        //     error:true,
        //     "error code":err.code,
        //     "error message":err.message
        // });
        res.status(408).json({
            status: getReasonPhrase(408),
            "status code": 408,
            error: true,
            "error message": "Request Timeout",
            response: {}
        })
        console.log(err);
    }
}

async function verifyotp(req, res) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (token) {
            jwt.verify(token, "secret_key", async (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        status: getReasonPhrase(401),
                        "status code": 401,
                        error: true,
                        "error message": err.message,
                        response: {}
                    })
                }
                else {
                    let data = await Otp.findOne({
                        where: {
                            email: decoded.email
                        }
                    });
                    if (data != null) {
                        if (req.body.otp == data.otp) {
                            const token = jwt.sign({ email: decoded.email, status: "verified" }, "secret_key");
                            res.status(200).json({
                                status: getReasonPhrase(200),
                                "status code": 200,
                                error: null,
                                response: {
                                    message: 'Email verified successfully',
                                    token: token
                                }

                            });
                            await Otp.destroy({
                                where: {
                                    email: decoded.email
                                }
                            });
                        }
                        else {
                            res.status(406).json({
                                status: getReasonPhrase(406),
                                "status code": 406,
                                error: true,
                                "error message": 'Wrong OTP',
                                response: {}
                            })
                        }
                    } else {
                        res.status(409).json({
                            status: getReasonPhrase(409),
                            "status code": 409,
                            error: true,
                            "error message": 'Email already verified',
                            response: {}
                        })
                    }
                }
            })
        } else {
            res.status(401).json({
                status: getReasonPhrase(401),
                "status code": 401,
                error: true,
                "error message": "JWT not provided",
                response: {}
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function register_customer(req, res) {
    // console.log(`addcustomers`);
    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            jwt.verify(token, 'secret_key', async (err, decoded) => {
                if (err) {
                    console.log('Invalid Token');
                    return res.status(401).json({
                        status: getReasonPhrase(401),
                        "status code": 401,
                        error: true,
                        "error message": err.message,
                        response: {}
                    })
                }
                else {
                    if (decoded.status == 'verified' && decoded.email == req.body.email) {
                        let customerdata = await Customer.findOne({
                            where: {
                                [db.Sequelize.Op.or]: [
                                    { email: decoded.email },
                                    { phone: req.body.phone }
                                ]
                            }
                        });
                        if (customerdata == null) {
                            // console.log("3------------");
                            const salt = await bcrypt.genSalt(10);
                            req.body.password = await bcrypt.hash(req.body.password, salt);
                            let data = await Customer.create({
                                email: req.body.email,
                                name: req.body.name,
                                phone: req.body.phone,
                                password: req.body.password
                            });
                            // console.log(data.id);
                            res.status(201).json({
                                status: getReasonPhrase(201),
                                "status code": 201,
                                error: null,
                                response: {
                                    message: `Registration successful, login to continue`,
                                    uniqueID: data.id
                                }
                            })
                        } else {
                            console.log(`Customer details with ${decoded.email} already exists`);
                            res.status(409).json({
                                status: getReasonPhrase(409),
                                "status code": 409,
                                error: true,
                                "error message": "Email or phone already exists",
                                response: {}
                            })
                        }
                    } else {
                        // console.log("5-------------");
                        res.json({
                            status: ReasonPhrases.BAD_REQUEST,
                            "status code": StatusCodes.BAD_REQUEST,
                            error: true,
                            "error message": "Email mismatched",
                            response: {}
                        })

                    }
                }
            })
        } else {
            console.log(`please provide token`);
            res.status(401).json({
                status: getReasonPhrase(401),
                "status code": 401,
                error: true,
                "error message": "JWT not provided",
                response: {}
            });
        }
    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function login(req, res) {
    try {
        let data = await Customer.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { email: req.body.email_phone },
                    { phone: req.body.email_phone }
                ]
            }
        });
        if (data != null) {
            if (data.status == -1) {
                res.json({
                    status: getReasonPhrase(403),
                    "staus code": 403,
                    error: true,
                    "error message": 'You are blocked, please contact admin',
                    response: {}
                })
            } else {
                bcrypt.compare(req.body.password, data.password, (err, check) => {
                    if (err) {
                        res.status(408).json({
                            status: getReasonPhrase(408),
                            "status code": 408,
                            error: true,
                            "error message": "Request Timeout",
                            response: {}
                        })
                        console.log(err);
                    } else {
                        if (check) {
                            const token = jwt.sign({ id: data.id, usertype: data.usertype }, 'secret_key');
                            res.json({
                                status: ReasonPhrases.OK,
                                "status code": 200,
                                error: null,
                                response: {
                                    message: 'Login successful',
                                    token: token
                                }
                            })
                        } else {
                            res.json({
                                status: getReasonPhrase(401),
                                "status code": 401,
                                error: true,
                                "error message": "Invalid Credentials",
                                response: {}
                            })
                        }
                    }
                })
            }
        } else {
            res.json({
                status: getReasonPhrase(401),
                "status code": 401,
                error: true,
                "error message": "Email or Phone no. not registered",
                response: {}
            })
        }
    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function addaddress(req, res) {
    try {
        let data = await Customeraddress.create({
            addressLine: req.body.addressLine,
            pin_code: req.body.pin_code,
            city: req.body.city,
            state: req.body.state,
            customer_id: req.decoded.id
        });
        await Customer.update({
            status: 1
        }, {
            where: {
                id: req.decoded.id
            }
        })
        let addressdata = await Customeraddress.findAll({
            attributes: [["id", "address_id"], "addressLine", "pin_code", "city", "state"],
            where: {
                customer_id: req.decoded.id
            }
        })
        success(req, res, 201, "Address details added", addressdata);
    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function showproduct(req, res) {
    try {
        const page = req.query.page ?? 1;
        const limit = req.query.limit ?? 10;
        let productdata = await Product.findAll({
            attributes: [["id", "product_id"], "hsncode", "productname", "productdescription", "rate", "quantity"],
            include: { model: Merchant, attributes: ["merchantname"] },
            where: {
                status: 1
            },
            raw: true,
            offset: (page - 1) * limit,
            limit: +limit,
        });
        if (productdata.length == 0) {
            error(req, res, 404, "No product found");
        } else {
            for (let i = 0; i < productdata.length; i++) {
                delete Object.assign(productdata[i], { ["stock"]: productdata[i]["quantity"] })["quantity"];
                if (productdata[i].stock >= 10) {
                    productdata[i].stock = "In stock"
                } else if (productdata[i].stock < 10 && productdata[i].stock > 0) {
                    productdata[i].stock = `Only ${productdata[i].stock} left`
                }
                else {
                    productdata[i].quantity = "Out of stock"
                }
            }
            success(req, res, 200, "Productlist", productdata);

        }

    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Servor Error", err.message);
    }
}

async function addtocart(req, res) {
    try {
        console.log('1-------------')
        let product_in_cart = await Cart.findOne({
            where: {
                product_id: req.body.product_id,
                customer_id: req.decoded.id
            },
        });
        console.log('2-------------')

        if (product_in_cart != null) {
            res.status(409).json({
                status: ReasonPhrases.CONFLICT,
                "status code": StatusCodes.CONFLICT,
                error: true,
                "error message": 'Product already exists in the cart, Update your cart',
                response: {}
            })
        } else {
            console.log('3-------------')

            let productdetails = await Product.findOne({
                attributes: [["id", "product_id"], "hsncode", "productname", 'rate', 'quantity', "discount", "sellingprice", 'merchant_id'],
                where: {
                    id: req.body.product_id,
                },
                raw: true
            });
            console.log('4-------------')

            // console.log(productdetails);
            if (productdetails) {

            } else {

            }
            let check = (productdetails.quantity) - (req.body.quantity);
            if (check >= 0) {
                let data = await Cart.create({
                    hsncode: productdetails.hsncode,
                    productname: productdetails.productname,
                    quantity: req.body.quantity,
                    customer_id: req.decoded.id,
                    merchant_id: productdetails.merchant_id,
                    product_id: productdetails.product_id
                });
                console.log('5-------------')

                let productsincart = await Cart.findAll({
                    attributes: ["product_id", "hsncode", "productname", "quantity"],
                    raw: true,
                    where: {
                        customer_id: req.decoded.id
                    },
                    order: [["product_id", "ASC"]],
                    include: [
                        {
                            model: Merchant, attributes: ["merchantname"]
                        }
                    ]
                });
                console.log('6-------------')

                // console.log(productsincart);
                let pro_id_arr = [];
                for (let i = 0; i < productsincart.length; i++) {
                    pro_id_arr[i] = productsincart[i].product_id;
                }
                let productdetails1 = await Product.findAll({
                    attributes: { exclude: ["createdAt", "updatedAt"] },
                    where: {
                        id: pro_id_arr
                    },
                    order: [["id", "ASC"]],
                    raw: true
                });
                for (let i = 0; i < productdetails1.length; i++) {
                    productsincart[i].rate = productdetails1[i].rate;
                    productsincart[i].discount = productdetails1[i].discount;
                    productsincart[i].sellingprice = productdetails1[i].sellingprice;
                    productsincart[i].discountvalue = (productsincart[i].rate - productsincart[i].sellingprice) * productsincart[i].quantity
                    productsincart[i].amount = productsincart[i].quantity * productdetails1[i].sellingprice;
                }
                const tax = 10;
                const customercart = {};
                customercart.totalquantity = 0;

                customercart.totaldiscount = 0;
                customercart.subtotal = 0;
                for (let i = 0; i < productsincart.length; i++) {
                    customercart.totalquantity += Number(productsincart[i].quantity);
                    customercart.totaldiscount += Number(productsincart[i].discountvalue);
                    customercart.subtotal += Number(productsincart[i].amount);
                }
                customercart.totaldiscount.toFixed(2);
                customercart.subtotal.toFixed(2);
                customercart.shippingcharge = (customercart.subtotal >= 1000) ? 0 : 70
                customercart.totaltax = customercart.subtotal * tax / 100;
                customercart.grandtotal = Number(customercart.subtotal) + Number(customercart.totaltax) + Number(customercart.shippingcharge);
                // customercart.delieveryaddress = delieveryaddress;
                // customercart.payment = req.body.payment;
                // customercart.customer_id = req.decoded.id;
                customercart.totaltax.toFixed(2);
                customercart.grandtotal.toFixed(2);
                success(req, res, 201, "Product added to cart successfully", [productsincart, customercart])
                // res.status(201).json({
                //     status: getReasonPhrase(201),
                //     "status code": 201,
                //     error: null,
                //     response: {
                //         message: 'Product added to cart successfully',
                //         products_in_the_cart: productsincart
                //     }
                // })
            } else {
                res.json({
                    status: getReasonPhrase(200),
                    "status code": 200,
                    error: false,
                    response: {
                        message: "Not enough quantity",
                        itemleft: productdetails.quantity
                    }

                });
            }
        }
    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function showcart(req, res) {
    try {
        let productsincart = await Cart.findAll({
            attributes: ["product_id", "hsncode", "productname", "quantity"],
            where: {
                customer_id: req.decoded.id
            },
            raw: true,
            order: [["product_id", "ASC"]],
            include: [
                { model: Merchant, attributes: ["merchantname"] }
            ]
        });
        if (productsincart.length != 0) {
            let pro_id_arr = [];
            for (let i = 0; i < productsincart.length; i++) {
                pro_id_arr[i] = productsincart[i].product_id;
            }
            let productdetails = await Product.findAll({
                where: {
                    id: pro_id_arr
                },
                order: [["id", "ASC"]],
                raw: true
            });
            for (let i = 0; i < productdetails.length; i++) {
                productsincart[i].rate = productdetails[i].rate;
                productsincart[i].discount = productdetails[i].discount;
                productsincart[i].sellingprice = productdetails[i].sellingprice;
                productsincart[i].discountvalue = (productsincart[i].rate - productsincart[i].sellingprice) * productsincart[i].quantity
                productsincart[i].amount = productsincart[i].quantity * productsincart[i].sellingprice;
            }
            const tax = 10;
            const customercart = {};
            customercart.totalquantity = 0;

            customercart.totaldiscount = 0;
            customercart.subtotal = 0;
            for (let i = 0; i < productsincart.length; i++) {
                customercart.totalquantity += Number(productsincart[i].quantity);
                customercart.totaldiscount += Number(productsincart[i].discountvalue);
                customercart.subtotal += Number(productsincart[i].amount);
            }
            customercart.totaldiscount.toFixed(2);
            customercart.subtotal.toFixed(2);
            customercart.shippingcharge = (customercart.subtotal >= 1000) ? 0 : 70
            customercart.totaltax = customercart.subtotal * tax / 100;
            customercart.grandtotal = Number(customercart.subtotal) + Number(customercart.totaltax) + Number(customercart.shippingcharge);
            customercart.totaltax.toFixed(2);
            customercart.grandtotal.toFixed(2);
            success(req, res, 201, "Products in cart", [productsincart, customercart])
            // res.json({
            //     status: getReasonPhrase(200),
            //     "status code": 200,
            //     error: null,
            //     response: {
            //         message: 'Cart Details',
            //         products_in_the_cart: productsincart
            //     }
            // })
        } else {
            res.json({
                status: getReasonPhrase(204),
                "status code": 204,
                error: false,
                response: {
                    message: "No products in the cart"
                }
            })
        }

    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function updatecart(req, res) {
    try {
        let { quantity } = req.body;
        let cartproduct_details = await Cart.findOne({
            attributes: ["product_id", "hsncode", "productname", "quantity"],
            where: {
                product_id: req.body.product_id,
                customer_id: req.decoded.id
            },
            include: [
                { model: Merchant, attributes: ["merchantname"] },
            ],
            raw: true
        });
        let productdetail = await Product.findOne({
            where: {
                id: req.body.product_id
            },
            raw: true
        });
        cartproduct_details.rate = productdetail.rate;
        cartproduct_details.discount = productdetail.discount;
        cartproduct_details.sellingprice = productdetail.sellingprice;
        if (productdetail.quantity == 0) {
            cartproduct_details.stock = "Out of stock";
            res.json({
                status: true,
                "status code": 200,
                error: false,
                response: {
                    message: "Product is out of stock",
                    productdetail: cartproduct_details
                }
            })
        }
        else if (productdetail.quantity < quantity) {
            cartproduct_details.stock = `Only ${productdetail.quantity} left`
            res.json({
                status: true,
                "status code": 200,
                error: false,
                response: {
                    message: "Not enough quantity",
                    productdetail: cartproduct_details
                }
            })
        } else {
            cartproduct_details.quantity = quantity;
            cartproduct_details.amount = quantity * cartproduct_details.sellingprice;
            await Cart.update({
                quantity: quantity
            }, {
                where: {
                    customer_id: req.decoded.id,
                    product_id: req.body.product_id
                }
            })
            res.json({
                status: true,
                "status code": 200,
                error: false,
                response: {
                    message: "Product in cart updated",
                    productdetail: cartproduct_details
                }
            })
        }
    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function deleteproductfromcart(req, res) {
    try {
        let { product_id } = req.body;
        await Cart.destroy({
            where: {
                customer_id: req.decoded.id,
                product_id: product_id,
            },
        });
        res.json({
            status: ReasonPhrases.OK,
            "status_code": 200,
            error: null,
            response: {
                message: `Product with id ${product_id} deleted successfully from cart`
            }
        });
    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function showaddresses(req, res) {
    try {
        let addressdata = await Customeraddress.findAll({
            attributes: [["id", "address_id"], "addressLine", "pin_code", "city", "state"],
            where: {
                customer_id: req.decoded.id
            }
        });
        if (addressdata.length == 0) {
            error(req, res, 404, "No addresses added")
        } else {
            success(req, res, 200, "Your addresses", addressdata);
        }

    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function ordercheck(req, res, next) {
    try {
        let delieveryaddress = await Customeraddress.findOne({
            where: {
                id: req.body.address_id
            },
        });
        if (delieveryaddress == null) {
            res.json({
                status: getReasonPhrase(404),
                "status code": 404,
                error: true,
                "error message": 'Address not found, Please add your address '
            });
        } else {
            delieveryaddress = delieveryaddress.addressLine + " " + delieveryaddress.pin_code + " " + delieveryaddress.city + " " + delieveryaddress.state
            let customercartdetails = await Cart.findAll({
                attributes: [
                    "product_id", "hsncode", "productname", "quantity", "customer_id", "merchant_id"
                ],
                where: {
                    customer_id: req.decoded.id
                },
                raw: true,
                order: [["product_id", "ASC"]]
            });
            // console.log(customercartdetails);
            if (customercartdetails.length == 0) {
                console.log('No products in the cart, add products to cart to placeorder');
                res.json({
                    status: getReasonPhrase(204),
                    "status code": 204,
                    error: null,
                    response: {
                        message: 'No products in the cart, add products to cart to placeorder'
                    }

                });
            } else {
                let pro_id_arr = [];
                for (let i = 0; i < customercartdetails.length; i++) {
                    pro_id_arr[i] = customercartdetails[i].product_id;
                }
                let productdetails = await Product.findAll({
                    where: {
                        id: pro_id_arr
                    },
                    // attributes: { exclude: ["createdAt", "updatedAt"] },
                    order: [["id", "ASC"]],
                    raw: true
                });
                // console.log(productdetails);
                for (let i = 0; i < customercartdetails.length; i++) {
                    if (productdetails[i].quantity == 0) {
                        customercartdetails[i].stock = "Out of Stock";
                    }
                    else if (customercartdetails[i].quantity > productdetails[i].quantity) {
                        customercartdetails[i].stock = "Not enough quantity";
                        customercartdetails[i].itemleft = productdetails[i].quantity
                    }
                    else {
                        customercartdetails[i].stock = 'In stock'
                    }
                }
                let flag = 1;
                console.log(customercartdetails);
                for (let i = 0; i < customercartdetails.length; i++) {
                    if (customercartdetails[i].stock == 'Out of Stock' || customercartdetails[i].stock == "Not enough quantity") {
                        flag = 0;
                    }

                }
                if (flag == 0) {
                    let i = 0;
                    while (i < productdetails.length) {
                        if (customercartdetails[i].stock == "In stock") {
                            customercartdetails.splice(i, 1);
                            productdetails.splice(i, 1);
                            continue;
                        }
                        customercartdetails[i].rate = productdetails[i].rate;
                        customercartdetails[i].discount = productdetails[i].discount;
                        customercartdetails[i].sellingprice = productdetails[i].sellingprice;
                        i++;
                    }
                    error(req, res, 404, "Order Failed due to unavaliability of following items", customercartdetails)
                } else {
                    const tax = 10;
                    const customercart = {};
                    customercart.totalquantity = 0;
                    customercart.total = 0;
                    customercart.totaldiscount = 0;
                    customercart.subtotal = 0;

                    for (let i = 0; i < productdetails.length; i++) {
                        customercartdetails[i].rate = productdetails[i].rate;
                        customercartdetails[i].discount = productdetails[i].discount;
                        customercartdetails[i].sellingprice = productdetails[i].sellingprice;
                        customercartdetails[i].discountvalue = (customercartdetails[i].rate - customercartdetails[i].sellingprice) * customercartdetails[i].quantity
                        customercartdetails[i].amount = customercartdetails[i].quantity * customercartdetails[i].sellingprice
                    }
                    console.log(customercartdetails);
                    for (let i = 0; i < customercartdetails.length; i++) {
                        customercart.totalquantity += Number(customercartdetails[i].quantity);
                        customercart.totaldiscount += Number(customercartdetails[i].discountvalue);
                        customercart.subtotal += Number(customercartdetails[i].amount);
                    }
                    customercart.shippingcharge = (customercart.subtotal >= 1000) ? 0 : 70
                    customercart.totaltax = customercart.subtotal * tax / 100;
                    customercart.grandtotal = Number(customercart.subtotal) + Number(customercart.totaltax) + Number(customercart.shippingcharge);
                    customercart.delieveryaddress = delieveryaddress;
                    // customercart.payment = req.body.payment;
                    customercart.customer_id = req.decoded.id;
                    req.customercart = customercart;
                    req.customercartdetails = customercartdetails;
                    req.productdetails = productdetails
                    next();
                }
            }
        }

    } catch (err) {
        console.log(err)
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function initiate_payment(req, res, next) {
    try {
        const { cardnumber, expmonth, expyear, cvc } = req.body;
        let customerdetails = await getcustomerdetails({ customer_id: req.decoded.id, address_id: req.body.address_id });
        console.log(customerdetails)
        addressdetails = customerdetails['Addresses.addressLine'] + customerdetails['Addresses.city'] + customerdetails['Addresses.pin_code'] + customerdetails['Addresses.state'];
        // console.log(addressdetails);

        let customer = await stripe.customers.create({
            name: customerdetails.name,
            email: customerdetails.email,
            phone: customerdetails.phone
        });
        // console.log(customer.id);
        let method = await stripe.paymentMethods.create({
            type: "card",
            card: {
                number: cardnumber,
                exp_month: expmonth,
                exp_year: expyear,
                cvc: cvc
            },
            billing_details: {
                address: {
                    city: customerdetails['Addresses.city'],
                    line1: customerdetails['Addresses.addressLine'],
                    line2: customerdetails['Addresses.addressLine'],
                    postal_code: customerdetails['Addresses.pin_code'],
                    state: customerdetails['Addresses.state'],
                    country: "IN"
                },
                email: customer.email,
                name: customer.name,
                phone: customer.phone
            }
        });
        // console.log(method);
        let intent = await stripe.paymentIntents.create({
            payment_method: method.id,
            amount: req.customercart.grandtotal * 100,
            currency: 'inr',
            payment_method_types: ["card"],
            customer: customer.id,
            // confirmation_method:'automatic',
            confirm: true,
            off_session: true
        });
        console.log(intent);
        req.customer_id = customer.id
        req.paid = intent.charges.data[0].paid;
        req.payment_id = intent.id;
        next();
        // success(req, res, 202, "Payment successful", intent);
    } catch (err) {
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function placeorder(req, res) {
    try {
        const customercart = req.customercart;
        customercart.payment = "paid";
        const customercartdetails = req.customercartdetails;
        const productdetails = req.productdetails;
        let order = await Order.create(customercart);
        let payment = await Payment.create({
            customer_id: req.decoded.id,
            payment_id: req.body.payment_id,
            customer: req.decoded.id,
            payment_status: "paid",
            order_id: req.body.order_id
        });

        for (let i = 0; i < customercartdetails.length; i++) {
            customercartdetails[i].order_id = order.id;
        }

        await Orderhistory.bulkCreate(customercartdetails);

        for (let i = 0; i < productdetails.length; i++) {
            productdetails[i].quantity -= customercartdetails[i].quantity;
        }
        // console.log(productdetails);
        await Cart.destroy({
            where: { customer_id: req.decoded.id }
        });
        await Product.bulkCreate(productdetails, {
            updateOnDuplicate: ["quantity"]
        });
        success(req, res, 201, "Order placed Successfully", [order, customercartdetails])

    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function searchproducts(req, res) {
    try {
        const { search } = req.body
        if (search) {
            let productdata = await Product.findAll({
                attributes: [["id", "product_id"], "hsncode", "productname", "productdescription", "rate", "quantity"],
                where: {
                    status: 1,
                    [db.Sequelize.Op.or]: [{
                        productname: {
                            [db.Sequelize.Op.like]: `${req.body.search}%`
                        }
                    },
                    {
                        productdescription: {
                            [db.Sequelize.Op.like]: `%${req.body.search}%`
                        }
                    }
                    ]
                },
                raw: true,
                include: [
                    { model: Merchant, attributes: ["merchantname"] }
                ]
            });
            if (productdata.length == 0) {
                error(req, res, 404, "No product found");
            } else {
                for (let i = 0; i < productdata.length; i++) {
                    delete Object.assign(productdata[i], { ["stock"]: productdata[i]["quantity"] })["quantity"];
                    if (productdata[i].stock >= 10) {
                        productdata[i].stock = "In stock"
                    } else if (productdata[i].stock < 10 && productdata[i].stock > 0) {
                        productdata[i].stock = `Only ${productdata[i].stock} left`
                    }
                    else {
                        productdata[i].stock = "Out of stock"
                    }
                }
                success(req, res, 200, "Matched Products are:", productdata);
            }

        } else {
            searchproductby(req, res);
        }

    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }

}

async function searchproductbycategory(req, res, category, page, limit) {
    try {
        let productdata = await Product.findAll({
            attributes: [["id", 'product_id'], "hsncode", "productname", "productdescription", "rate", "discount", "quantity", "sellingprice"],
            where: {
                status: 1
            },
            include: [
                { model: Category, attributes: [], where: { categoryname: category } },
                { model: Subcategory, attributes: ["subcategoryname"] },
                { model: Merchant, attributes: ["merchantname"] }
            ],
            offset: (page - 1) * limit,
            limit: limit,
            raw: true
        });
        if (productdata.length == 0) {
            error(req, res, 404, 'No product found in this category');
        }
        else {
            for (let i = 0; i < productdata.length; i++) {
                // console.log(productdata[i]);
                delete Object.assign(productdata[i], { ["stock"]: productdata[i]["quantity"] })["quantity"];
                if (productdata[i].stock >= 10) {
                    // console.log('In stock')
                    productdata[i].stock = "In stock"
                } else if (productdata[i].stock < 10 && productdata[i].stock > 0) {
                    productdata[i].stock = `Only ${productdata[i].stock} left`
                }
                else {
                    // console.log('Out of stock')
                    productdata[i].stock = "Out of stock"
                }
            }
            success(req, res, 200, "Products in this category", productdata);
        }
    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function searchproductbysubcategory(req, res, subcategory, page, limit) {
    try {
        let productdata = await Product.findAll({
            attributes: [["id", 'product_id'], "productname", "productdescription", "quantity", "rate", "discount", "sellingprice"],
            include: [
                { model: Subcategory, attributes: [], where: { subcategoryname: subcategory } },
                { model: Merchant, attributes: ["merchantname"] }
            ],
            where: {
                status: 1
            },
            offset: (page - 1) * limit,
            limit: limit,
            raw: true
        });
        if (productdata.length == 0) {
            error(req, res, 404, "No products found in the subcategory");
        } else {
            for (let i = 0; i < productdata.length; i++) {
                delete Object.assign(productdata[i], { ["stock"]: productdata[i]["quantity"] })["quantity"];
                if (productdata[i].stock >= 10) {
                    productdata[i].stock = "In stock"
                } else if (productdata[i].stock < 10 && productdata[i].stock > 0) {
                    productdata[i].stock = `Only ${productdata[i].stock} left`
                }
                else {
                    productdata[i].stock = "Out of stock"
                }
            }
            success(req, res, 200, "Products in this subcategory", productdata);
        }
    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function searchproductby(req, res) {
    try {
        const category = req.query.category;
        const subcategory = req.query.subcategory;
        const page = req.query.page ?? 1;
        const limit = (req.query.limit ?? 12) * 1;
        if (category || subcategory) {
            if (subcategory) {
                searchproductbysubcategory(req, res, subcategory, page, limit);

            } else {
                searchproductbycategory(req, res, category, page, limit);
            }
        } else {
            showproduct(req, res);
        }
    } catch (err) {
        console.log(err);
        res.json({
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            "status code": 500,
            error: true,
            "error message": err.message,
            response: {}
        });
    }
}

async function show_orderhistory(req, res) {
    try {
        if (req.query.order_id) {
            console.log('showorderhistory');
            let [ordersummary, orderhistorylist_order_id] = await getorderhistorylist_order_id({ customer_id: req.decoded.id, order_id: req.query.order_id });
            console.log('I am sorry babu')
            if (orderhistorylist_order_id.length == 0) {
                error(req, res, 404, "No product found with this order_id");
            } else {
                success(req, res, 200, `No. of Products ordered =${orderhistorylist_order_id.length}`, [ordersummary, orderhistorylist_order_id]);
            }
        } else {
            let orderhistorylist_till_now = await getorderhistorylist({ customer_id: req.decoded.id });
            if (orderhistorylist_till_now.length == 0) {
                error(req, res, 404, "No order placed till now");
            } else {
                success(req, res, 200, `No. of Products ordered till now =${orderhistorylist_till_now.length}`, orderhistorylist_till_now);
            }
        }
    } catch (err) {
        console.log(err);
        error(req, res, 500, "Internal Server Error", err.message);
    }
}

async function razorpayorderID(req, res) {
    // const {amount} = req.body;
    console.log("razorpayorderID")
    const instance = new razorpay({ key_id: 'rzp_test_naajBB4kEXIZin', key_secret: 'CwQoYEbiBs8ikUQfdQVmQkDL' })
    let order = await instance.orders.create({
        amount:500 * 100,
        currency: 'INR',
        receipt: "hellow123"
    });
    res.status(201).json({
        success: true,
        order_id:order.id,
        amount: order.amount
    });
}

async function verify_signature(req, res, next) {
    let order_id = req.body.order_id;
    let razorpay_payment_id = req.body.payment_id;
    let razorpay_signature = req.body.signature;
    const hmac = crypto.createHmac('sha256', "CwQoYEbiBs8ikUQfdQVmQkDL");

    hmac.update(order_id + "|" + razorpay_payment_id);
    let generatedSignature = hmac.digest('hex');

    // const generatedSignature = crypto
    //     .createHmac(
    //         "SHA256",
    //         "CwQoYEbiBs8ikUQfdQVmQkDL"
    //     ).update(order_id + "|" + razorpay_payment_id)
    //     .digest("hex");
    // const generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, "CwQoYEbiBs8ikUQfdQVmQkDL");

    if (generatedSignature == razorpay_signature) {
        next();
    }
    else {
        error(res, res, 406, "Payment not successful")
    }

}

module.exports = {
    sendotp,
    verifyotp,
    register_customer,
    login,
    addaddress,
    showproduct,
    addtocart,
    updatecart,
    deleteproductfromcart,
    searchproducts,
    searchproductby,
    showcart,
    showaddresses,
    ordercheck,
    initiate_payment,
    placeorder,
    show_orderhistory,
    razorpayorderID,
    verify_signature
}