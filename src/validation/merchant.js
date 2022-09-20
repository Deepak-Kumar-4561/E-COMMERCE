const joi = require('joi');

const merchant_register_schema = joi.object({
    merchantname:joi.string().required(),
    email:joi.string().email().required().trim(),
    phone:joi.string().required().trim().pattern(/[6-9]{1}[0-9]{9}/),
    GSTIN:joi.string().required().trim().length(15),
    address:joi.string().required()
});

const password_schema = joi.object({
    password:joi.string().required().trim(true).min(6).max(15).pattern(/[a-zA-Z0-9!@#$%&]{6,15}$/),
    confirmpassword:joi.ref('password')
});

const category_schema = joi.object({
    categoryname:joi.string().required().pattern(/^[a-zA-Z' ]*$/)
});
const subcategory_schema = joi.object({
    subcategoryname:joi.string().required().pattern(/^[a-zA-Z ]*$/),
    category_id:joi.number().required()
})

const add_product_schema = joi.object({
    hsncode:joi.number().required(),
    productname:joi.string().required(),
    productdescription:joi.string().required(),
    category_id:joi.number().required(),
    subcategory_id:joi.number().required(),
    quantity:joi.number().positive().required(),
    rate:joi.number().positive().precision(2).required(),
    discount:joi.number().positive().precision(2).required()
})

const update_product_schema = joi.object({
    product_id:joi.number().required(),
    productdescription:joi.string(),
    quantity:joi.number(),
    rate:joi.number().precision(2),
    discount:joi.number().precision(2)
});

const delete_product_schema = joi.object({
    product_id:joi.number().required()
})
const search_customer_schema = joi.object({
    customer_id:joi.number().required().positive(),
    page:joi.number(),
    limit:joi.number()
});
const search_product_schema = joi.object({
    hsncode:joi.number().positive().required(),
    page:joi.number(),
    limit:joi.number()
})

module.exports = {
    merchant_register_schema,
    password_schema,
    category_schema,
    subcategory_schema,
    add_product_schema,
    update_product_schema,
    delete_product_schema,
    search_customer_schema,
    search_product_schema
}