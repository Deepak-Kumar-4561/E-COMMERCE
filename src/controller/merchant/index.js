console.log("merchantcontroller")
const jwt = require('jsonwebtoken');
const db = require('../../model');
const bcrypt = require('bcrypt');
// const { Orderhistory, Order } = require('../../model');
const { number } = require('joi');
const {
    getReasonPhrase,
    ReasonPhrases,
    StatusCodes } = require('http-status-codes');
const {success,error} = require('../../response');
const Merchant = db.Merchant;
const Product = db.Product;
const Category = db.Category;
const Subcategory = db.Subcategory;
const Customer = db.Customer;
const Order = db.Order;
const Orderhistory = db.Orderhistory;


async function merchantregister(req, res) {
    try {
        let data = await Merchant.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { email: req.body.email },
                    { phone: req.body.phone },
                    { merchantname: req.body.merchantname },
                    { GSTIN: req.body.GSTIN }
                ]
            }
        });
        if (data == null) {
            let data1 = await Merchant.create({
                email: req.body.email,
                merchantname: req.body.merchantname,
                phone: req.body.phone,
                address: req.body.address,
                GSTIN: req.body.GSTIN,
            });
            console.log('merchant details has been sent to the admin for approval');
            res.json({
                status: getReasonPhrase(202),
                "status code": 202,
                error: null,
                response: {
                    message: `Your details has been sent to the admin. You will receive an email for setting password after approval`
                }
            })
        } else {
            console.log('merchant already exists');
            res.json({
                status: getReasonPhrase(409),
                "status code": 409,
                error: true,
                "error message": 'Merchant already Exists',
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

async function setpassword(req, res) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (token) {
            jwt.verify(token, 'secret_key', async (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        status: getReasonPhrase(401),
                        "status code": 401,
                        error: true,
                        "error message": err.message,
                        response: {}
                    });
                } else {
                    if (req.body.password === req.body.confirmpassword) {
                        let oldpass = await Merchant.findOne({
                            where: {
                                email: decoded.merchant_email
                            }
                        });
                        if (oldpass.password == null) {
                            const salt = await bcrypt.genSalt(10);
                            req.body.password = await bcrypt.hash(req.body.password, salt);
                            let data = await Merchant.update({
                                password: req.body.password,
                                status: 1
                            },
                                {
                                    where: {
                                        email: decoded.merchant_email
                                    }
                                });
                            console.log(data.id);
                            res.json({
                                status: getReasonPhrase(201),
                                "status code": 201,
                                error: null,
                                response: {
                                    message: 'Password set successfully'
                                }

                            })
                        } else {
                            res.json({
                                status: ReasonPhrases.CONFLICT,
                                "status code": StatusCodes.CONFLICT,
                                error: true,
                                "error message": 'Password already set',
                                response: {}
                            });
                        }
                    } else {
                        res.json({
                            status: getReasonPhrase(406),
                            "status code": 406,
                            error: true,
                            "error message": 'Password mismatched'
                        });
                    }
                }
            });
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

async function login(req, res) {
    try {
        let data = await Merchant.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { email: req.body.email_phone },
                    { phone: req.body.email_phone },
                ]
            }
        });
        if (data != null) {
            if (data.status == 0) {
                res.json({
                    status: ReasonPhrases.OK,
                    "status code": 200,
                    error: null,
                    response: {
                        message: 'Please set your password'
                    }
                })
            } else if (data.status == -1) {
                res.json({
                    status: getReasonPhrase(403),
                    "status code": 403,
                    error: true,
                    "error message": "Access Denied",
                    response: {}
                });
            } else {
                // console.log(data);
                bcrypt.compare(req.body.password, data.password, (err, check) => {
                    if (err) {
                        res.status(500).json({
                            status: getReasonPhrase(500),
                            "status code": 408,
                            error: true,
                            "error message": err.message,
                            response: {}
                        })
                    } else {
                        if (check) {
                            const token = jwt.sign({ id: data.id, usertype: 'merchant' }, "secret_key")
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
                status: getReasonPhrase(404),
                "status code": 404,
                error: true,
                "error message": 'merchant not register',
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

async function createcategory(req, res) {
    try {
        let [category, created] = await Category.findOrCreate({
            where: { categoryname: req.body.categoryname }
        });
        if (!created) {
            res.status(409).json({
                status: ReasonPhrases.CONFLICT,
                "status code": StatusCodes.CONFLICT,
                error: true,
                response: {
                    message: 'Category already exists',
                    categoryname: category.categoryname,
                    category_id: category.id
                }
            });
        } else {
            res.json({
                status: true,
                "status code": 201,
                error: null,
                response: {
                    message: "Category created successfully",
                    categoryname: category.categoryname,
                    categoryID: category.id
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

async function createsubcategory(req, res) {
    try {
        let [subcategory, created] = await Subcategory.findOrCreate({
            where:
            {
                subcategoryname: req.body.subcategoryname,
                category_id: req.body.category_id
            }
        });
        if (!created) {
            res.status(409).json({
                status: ReasonPhrases.CONFLICT,
                "status code": StatusCodes.CONFLICT,
                error: true,
                response: {
                    message: 'Subcategory already exists'
                }
            });
        } else {
            res.json({
                status: true,
                "status code": 201,
                error: null,
                response: {
                    message: "Subcategory created successfully",
                    subcategoryname: subcategory.subcategoryname,
                    subcategoryID: subcategory.id,
                    category_id: subcategory.category_id
                }
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

async function addproduct(req, res) {
    try {
        const { hsncode, productname, productdescription, category_id, subcategory_id, quantity, rate, discount } = req.body;
        let data = await Product.findOne({
            where: {
                merchant_id: req.decoded.id,
                [db.Sequelize.Op.or]: [
                    { hsncode: hsncode },
                    { productname: productname }
                ]
            }
        });
        if (data == null) {
            let category = await Category.findOne({
                where: {
                    id: category_id
                },
            });
            if (category != null) {
                let subcategory = await Subcategory.findOne({
                    where: {
                        [db.Sequelize.Op.and]: [
                            { id: subcategory_id },
                            { category_id: category_id }
                        ]
                    }
                });
                if (subcategory != null) {
                    let data1 = await Product.create({
                        hsncode: hsncode,
                        productname: productname,
                        productdescription: productdescription,
                        category_id: category.id,
                        subcategory_id: subcategory.id,
                        merchant_id: req.decoded.id,
                        quantity: quantity,
                        rate: rate,
                        discount: discount,
                        sellingprice: rate - rate * discount / 100
                    });
                    let productdata = await Product.findOne({
                        attributes: [["id", "product_id"], "hsncode", "productname", "productdescription", "rate", "quantity", "discount", "sellingprice"],
                        where: {
                            id: data1.id
                        },
                        raw: true,
                        include: [
                            { model: Category, attributes: [["id", "category_id"], "categoryname"] },
                            { model: Subcategory, attributes: [["id", "subcategory_id"], "subcategoryname"] }
                        ]
                    });
                    res.json({
                        status: getReasonPhrase(201),
                        "status code": 201,
                        error: null,
                        response: {
                            message: 'Product added',
                            productdetails: productdata
                        }
                    });
                } else {
                    res.json({
                        status: true,
                        "status code": 204,
                        response: {
                            message: "Subcategory not exists. Please add subcategory first"
                        }
                    });
                }
            } else {
                res.json({
                    status: true,
                    "status code": 204,
                    response: {
                        message: "Category not exists.Please add category first"
                    }
                });
            }
        }
        else if (data.status == 0) {
            await Product.update({
                productdescription: productdescription,
                quantity: quantity,
                rate: rate,
                discount: discount,
                sellingprice: rate * discount / 100,
                status: 1
            }, {
                where: {
                    hsncode: hsncode,
                    merchant_id: req.decoded.id
                }
            });
            res.json({
                status: true,
                "status code": 201,
                error: false,
                response: {
                    message: "Product restored with given details",
                }
            })
        }
        else if (data.status == -1) {
            res.json({
                status: false,
                "status code": 403,
                response: {
                    message: "Product blocked by admin,please contact"
                }
            })
        }
        else {
            res.status(409).json({
                status: ReasonPhrases.CONFLICT,
                "status code": StatusCodes.CONFLICT,
                error: true,
                "error message": 'Product already exists',
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

async function updateProductdetails(req, res) {
    try {
        let productdetails = await Product.findOne({
            where: {
                id: req.body.product_id
            },
            raw: true
        });
        if (productdetails.status == 0) {
            res.json({
                status: false,
                "status code": 403,
                response: {
                    message: "Product deleted from database, try to add it again"
                }
            });

        } else if (productdetails.status == -1) {
            res.json({
                status: false,
                "status code": 403,
                response: {
                    message: "Product blocked by admin, contact admin"
                }
            })
        }
        else {
            productdetails.productdescription = (req.body.productdescription) ?? (productdetails.productdescription);
            productdetails.quantity = (req.body.quantity) ?? 0;
            productdetails.rate = req.body.rate ?? productdetails.rate;
            productdetails.discount = req.body.discount ?? productdetails.discount;
            await Product.update(productdetails, {
                where: {
                    id: req.body.product_id
                }
            });
            console.log(productdetails);
            res.json({
                status: true,
                "status code": 200,
                error: false,
                response: {
                    message: 'Product Updated',
                    updatedproduct: productdetails
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
async function deleteproduct(req, res) {
    try {
        // let 
        await Product.update({
            quantity: 0,
            status: 0
        }, {
            where: {
                id: req.body.product_id
            }
        });
        res.json({
            status: true,
            "status code": 200,
            error: false,
            response: {
                message: "Product deleted successfully"
            }
        })
    } catch {
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

async function showallproduct(req, res, page, limit) {
    try {
        let data = await Product.findAll({
            attributes: [["id", "product_id"], "hsncode", 'productname', 'productdescription', 'rate', 'quantity', "discount"],
            where: {
                merchant_id: req.decoded.id,
                status: 1
            },
            raw: true,
            include: [
                { model: Category, attributes: ["categoryname"] },
                { model: Subcategory, attributes: ["subcategoryname"] }
            ],
            offset: (page - 1) * limit,
            limit: limit
        });
        if(data.length==0){
            error(req,res,404,"No products found");
        }else{
            success(req,res,200,"Product listing",data);
        }
    } catch (err) {
        console.log(err);
        error(req,res,500,"Internal Server Error",err.message);
    }
}

async function searchproductbycategory(req, res, category, page, limit) {
    try {
        let products = await Product.findAll({
            attributes: [["id", "product_id"], "hsncode", "productname", "productdescription", "rate", "quantity", "discount"],
            where: {
                merchant_id: req.decoded.id
            },
            raw: true,
            include: [
                { model: Category, attributes: ["categoryname"], where: { categoryname: category } },
                { model: Subcategory, attributes: ["subcategoryname"] }
            ],
            offset: (page - 1) * limit,
            limit: limit
        });
        if (products.length == 0) {
            error(req,res,404,"No products found in this category");
        } else {
            success(req,res,200,`Products avaliable in ${category} category`,products);
        }
    } catch (err) {
        console.log(err);
        error(req,res,500,"Internal Server Error",err.message);
        }
}

async function searchproductbysubcategory(req, res, subcategory, page, limit) {
    try {
        let products = await Product.findAll({
            attributes: [["id", "product_id"], "hsncode", "productname", "productdescription", "rate", "quantity", "discount"],
            where: {
                merchant_id: req.decoded.id,
            },
            raw: true,
            include: [
                {
                    model: Subcategory, attributes: ["subcategoryname"], where: {
                        subcategoryname: subcategory
                    }
                },
                {
                    model: Category, attributes: ["categoryname"]
                }
            ],
            offset: (page - 1) * limit,
            limit: limit
        });
        if (products.length == 0) {
            error(req,res,404,'No Products  found in this subcategory')
            
        } else {
            success(req,res,200,`Products avaliable in ${subcategory} subcategory`,products);
        }
    } catch (err) {
        console.log(err);
        error(req,res,500,"Internal Server Error",err.message);
    }
}

async function showproductby(req, res) {
    const category = req.query.category;
    const subcategory = req.query.subcategory;
    const page = req.query.page ?? 1;
    const limit = ((req.query.limit) ?? 3) * 1;
    if (category || subcategory) {
        if (subcategory) {
            console.log('subcategory start--------')
            searchproductbysubcategory(req, res, subcategory, page, limit)
            console.log('subcategory end--------')

        } else {
            console.log('category start--------')

            searchproductbycategory(req, res, category, page, limit);
            console.log('category end--------')

        }

    } else {
        showallproduct(req, res, page, limit);
    }
}

async function showproducts_purchased_by_customer(req, res) {
    try {
        let products = await Orderhistory.findAll({
            attributes: ["order_id","hsncode", "productname", "quantity", "rate", "discount", "sellingprice", "amount", "createdAt"],
            where: {
                merchant_id: req.decoded.id,
            },
            include: [
                {
                    model: Customer,
                    attributes: ["name"],
                    where: { id: req.query.customer_id }
                }
            ],
            raw:true
        });
        if (products.length == 0) {
            error(req,res,404,`No Product bought by customer with customer_id ${req.query.customer_id}`)
           
        } else {
            success(req,res,200,`No of products ordered = ${products.length}`,products);
        }
    } catch (err) {
        console.log(err);
        error(req,res,500,"Internal Server Error",err.message);
    }
}

async function showcustomers_bought_A_product(req,res){
    try {
        let products = await Orderhistory.findAll({
            attributes: [],
            where: {
                hsncode:req.query.hsncode,
                merchant_id:req.decoded.id
            },
            include: [
                {
                    model: Customer,
                    attributes: ["name"],
                }
            ],
            raw:true
        });
        if (products.length == 0) {
            error(req,res,404,"No customer bought this product")
        } else {
            success(req,res,200, `No of Customers bought this product = ${products.length}`,products)
        }
    } catch (err) {
        console.log(err);
        error(req,res,500,"Internal Server Error",err.message);
    }
}


async function showorder(req, res) {
    try {
        const page = req.query.page ?? 1;
        const limit = (req.query.limit ?? 3) * 1;
        let orders = await Orderhistory.findAll({
            attributes: ["hsncode", "productname", "quantity", "rate","discount","sellingprice", "amount"],
            where: {
                merchant_id: req.decoded.id
            },
            include: [
                { model: Customer, attributes: ["name", "email"] },
            ],
            offset: (page - 1) * limit,
            limit: limit,
            raw:true
        });
        if (orders.length == 0) {
           error(req,res,404,"No orders found");
        } else {
            success(req,res,200,`No. of products ordered = ${orders.length}`,orders);
        }
    } catch (err) {
        console.log(err);
        error(req,res,500,"Internal Server Error",err.message);
    }
}

module.exports = {
    merchantregister,
    setpassword,
    login,
    createcategory,
    createsubcategory,
    addproduct,
    updateProductdetails,
    deleteproduct,
    showproductby,
    showproducts_purchased_by_customer,
    showcustomers_bought_A_product,
    showorder
}