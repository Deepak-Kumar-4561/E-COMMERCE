const joi = require('joi');
const arr = [1,-1]

const approvemerchant_schema = joi.object({
    email:joi.string().email().required().trim(true)
});

const merchant_schema = joi.object({
    merchant_id:joi.number().positive(),
    status:joi.number().valid(...arr)
});
const customer_schema = joi.object({
    customer_id:joi.number().positive(),
    status:joi.number().valid(...arr)
});
const block_schema = joi.object({
    category:joi.string().required().valid("customer","merchant","product"),
    status:joi.number().required().valid(1,-1)
});
const customer_orderhisttory_schema = joi.object({
    customer_id:joi.number().required().positive(),
    order_id:joi.number().positive()
})


module.exports ={
    approvemerchant_schema,
    merchant_schema,
    customer_schema,
    block_schema,
    customer_orderhisttory_schema
}