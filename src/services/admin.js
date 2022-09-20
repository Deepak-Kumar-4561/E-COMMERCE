const db = require('../model');

const Customer = db.Customer;
const Merchant = db.Merchant;
const Address = db.Customeraddress;
const Category = db.Category;
const Subcategory = db.Subcategory;
const Product = db.Product;



function getmerchantlist() {
    let merchantlist = Merchant.findAll({
        attributes: [["id", "merchant_id"], "merchantname", "email", "phone", "address"],
        raw: true
    });
    return merchantlist;
}
function getmerchantlist_status(condition) {
    let merchantlist = Merchant.findAll({
        attributes: [["id", "merchant_id"], "merchantname", "email", "phone", "address"],
        where: {
            status: condition.status
        },
        raw: true
    });
    return merchantlist;
}
function getsinglemerchantdetails(condition) {
    return Merchant.findOne({
        attributes: [["id", "merchant_id"], "merchantname", "email", "phone", "address"],
        where: {
            id: condition.merchant_id,
        }
    });
}

function getcustomerlist() {
    return Customer.findAll({
        attributes: [["id", "customer_id"], "name", "email", "phone"],
        where: { usertype: "customer" },
        raw: true,
    });
}
function getcustomerlist_status(condition) {
    return Customer.findAll({
        attributes: [["id", "customer_id"], "name", "email", "phone"],
        where: {
            status: condition.status,
            usertype: "customer"
        },
        raw: true,
        include:[
            {model:Address,attributes:["addressLine","city","pin_code","state"]}
        ]
    });

}
function getsinglecustomerdetails(condition) {
    return Customer.findOne({
        attributes: [["id", "customer_id"], "name", "email", "phone"],
        where: {
            id: condition.customer_id,
            usertype: "customer"
        },
        raw: true,
        include:[
            {model:Address,attributes:["addressLine","city","pin_code","state"]}
        ]
    });
}

function getcategorylist() {
    return Category.findAll({
        attributes: [["id", "category_id"], "categoryname"],
        raw: true
    });
}
function getsubcategorylist() {
    return Subcategory.findAll({
        attributes: [["id", "subcategory_id"], "subcategoryname", "category_id"],
        include: [
            { model: Category, attributes: ["categoryname"] }
        ],
        raw: true
    });
}

function getmerchantproductlist(condition) {
    return Product.findAll({
        attributes: [["id", "product_id"], "productname", "quantity", "rate", "discount", "sellingprice"],
        where: {
            merchant_id: condition.merchant_id,
            status: 1
        },
        include: [
            {
                model: Merchant, attributes: [["id", "merchant_id"], "merchantname"]
            }
        ],
        raw: true
    });
}
function getproductlist() {
    return Product.findAll({
        attributes: [["id", "product_id"], "productname", "quantity", "rate", "discount", "sellingprice"],
        where: {
            status: 1
        },
        include: [
            {
                model: Merchant, attributes: [["id", "merchant_id"], "merchantname"]
            }
        ],
        raw: true
    });
}
function getmerchantproductlist_status(condition) {
    return Product.findAll({
        attributes: [["id", "product_id"], "productname", "quantity", "rate", "discount", "sellingprice"],
        where: {
            merchant_id: condition.merchant_id,
            status: condition.status
        },
        include: [
            {
                model: Merchant, attributes: [["id", "merchant_id"], "merchantname"]
            }
        ],
        raw: true
    });
}
function getproductlist_status(condition) {
    return Product.findAll({
        attributes: [["id", "product_id"], "productname", "quantity", "rate", "discount", "sellingprice"],
        where: {
            status: condition.status
        },
        include: [
            {
                model: Merchant, attributes: [["id", "merchant_id"], "merchantname"]
            }
        ],
        raw: true
    });
}

async function getcustomerorderhistorylist_order_id(condition) {
    try {
        let ordersummary = await Order.findOne({
            attributes: [["id", "order_id"], "totalquantity", "totaldiscount", "subtotal", "totaltax", "shippingcharge", "grandtotal", "delieveryaddress"],
            where: {
                id: condition.order_id,
            },
            raw: true
        });
        let orderhistorylist = await Orderhistory.findAll({
            attributes:["hsncode","productname","quantity","rate","discount","sellingprice","amount"],
            where:{
                customer_id:condition.customer_id,
                order_id:condition.order_id
            },
            inculde:[
                {
                    model:Merchant,attributes:["merchantname"]
                }
            ],
            raw:true
        });
        return [ordersummary,orderhistorylist];
    } catch (err) {

    }
}
function getcustomerorderhistorylist(condition){
    return Orderhistory.findAll({
        attributes:["hsncode","productname","quantity","rate","discount","sellingprice","amount"],
        where:{
            customer_id:condition.customer_id,
        },
        inculde:[
            {
                model:Merchant,attributes:["merchantname"]
            }
        ],
        raw:true
    });
}

module.exports = {
    getmerchantlist,
    getmerchantlist_status,
    getsinglemerchantdetails,
    getcustomerlist,
    getcustomerlist_status,
    getsinglecustomerdetails,
    getcategorylist,
    getsubcategorylist,
    getmerchantproductlist,
    getmerchantproductlist_status,
    getproductlist,
    getproductlist_status,
    getcustomerorderhistorylist_order_id,
    getcustomerorderhistorylist

}