const joi = require('joi');

const send_otp_schema=joi.object({
    email:joi.string().email().required().trim(true)
})

const verify_otp_schema = joi.object({
    otp:joi.string().length(4).required().trim(true).pattern(/[0-9]{4}/)
})

const customer_register_schema= joi.object({
    email:joi.string().email().required().trim(true).error((errors)=>{
        errors.forEach(err=>{
            switch(err.code){
                case "any.required":
                    err.message = "Email is required"
                    break;
                case "string.empty":
                    err.message = "Email can't be empty"
                    break;
                case "string.email":
                    err.message ="Invalid Email"
                    break;
            }
        });
        return errors
    }),
    name:joi.string().required().min(3).error((errors)=>{
        errors.forEach(err=>{
            switch(err.code){
                case "any.required":
                    err.message = "Name is required"
                    break;
                case "string.empty":
                    err.message = "Name can't be empty"
                    break;
                case "string.min":
                    err.message = "Name must be at least 3 characters long"
            }
        });
        return errors
    }),
    phone:joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).trim(true).required().error((errors)=>{
        errors.forEach(err=>{
            switch(err.code){
                case "any.required":
                    err.message = "Phone no. is required"
                    break;
                case "string.empty":
                    err.message = "Phone no. can't be empty"
                    break;
                case "string.length" :
                    err.message= "Phone no. must be of 10 digits"
                    break;
                case "string.pattern.base":
                    err.message = "Invalide phone no."
                    break;
            }
        });
        return errors;
    }),
    password:joi.string().trim(true).min(6).max(15).required().error((errors)=>{
        errors.forEach(err=>{
            switch(err.code){
                case "any.required":
                    err.message = "Password is required";
                    break;
                case "string.empty":
                    err.message = "Password can't be empty";
                    break;
                case "string.min":
                    err.message = "Password must be at least 6 characters long";
                    break;
                case "string.max":
                    err.message = "Password should not greater than 15 chracters";
                    break;
            }
        });
        return errors;
    })
});

const login_schema = joi.object({
    email_phone:joi.alternatives().try(
        joi.string().email(),
        joi.string().pattern(/[6-9]{1}[0-9]{9}/)
    ).required(),
    password:joi.string().trim(true).required().pattern(/[a-zA-Z0-9!@#$%&]{6,15}$/)
});

const customer_address_schema = joi.object({
    addressLine:joi.string().required(),
    pin_code:joi.string().length(6).required().trim(true),
    city:joi.string().required(),
    state:joi.string().required()
});

const add_to_cart_schema = joi.object({
    product_id:joi.number().required(),
    quantity:joi.number().positive()
})

const update_cart_schema = joi.object({
    quantity:joi.number().positive().required(),
    product_id:joi.number().required()
});

const delete_product_schema = joi.object({
    product_id:joi.number().required()
});

const place_order_schema = joi.object({
    address_id:joi.number().required(),
    cardnumber:joi.number().min(10**15).max(10**16-1).required(),
    expmonth:joi.number().positive().required().max(12),
    expyear:joi.number().positive().required().max(),
    cvc:joi.number().required().min(10**2).max(10**3-1)
})


module.exports = {
    send_otp_schema,
    verify_otp_schema,
    customer_register_schema,
    login_schema,
    customer_address_schema,
    add_to_cart_schema,
    update_cart_schema,
    delete_product_schema,
    place_order_schema
}