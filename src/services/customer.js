const db = require('../model');
const Orderhistory = db.Orderhistory;
const Customer = db.Customer;
const Order = db.Order;
const Merchant = db.Merchant;
const Address = db.Customeraddress;

function getcustomerdetails(condition) {
    return Customer.findOne({
        attributes: [["id", "customer_id"], "name", "email", "phone"],
        where: {
            id: condition.customer_id,
        },
        raw: true,
        include: [
            {
                model: Address, attributes: ["addressLine", "city", "pin_code", "state"],
                where: {
                    id: condition.address_id
                }
            }
        ]
    });
}


async function getorderhistorylist_order_id(condition) {
    let ordersummary = await Order.findOne({
        attributes: [["id", "order_id"], "totalquantity", "totaldiscount", "subtotal", "totaltax", "shippingcharge", "grandtotal", "delieveryaddress"],
        where: {
            id: condition.order_id
        },
        raw: true
    });
    let orderhistorylist = await Orderhistory.findAll({
        attributes: ["hsncode", "productname", "quantity", "rate", "discount", "sellingprice", "amount"],
        where: {
            customer_id: condition.customer_id,
            order_id: condition.order_id
        },
        inculde: [
            {
                model: Merchant, attributes: ["merchantname"]
            }
        ],
        raw: true
    });
    return [ordersummary, orderhistorylist];
}

function getorderhistorylist(condition) {
    return Orderhistory.findAll({
        attributes: ["hsncode", "productname", "quantity", "rate", "discount", "sellingprice", "amount"],
        where: {
            customer_id: condition.customer_id,
        },
        inculde: [
            {
                model: Merchant, attributes: ["merchantname"]
            }
        ],
        raw: true
    })
}

module.exports = {
    getorderhistorylist,
    getorderhistorylist_order_id,
    getcustomerdetails

}