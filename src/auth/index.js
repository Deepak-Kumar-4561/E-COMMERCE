console.log("customerauthorization")

const jwt = require('jsonwebtoken');
const { ReasonPhrases, StatusCodes,
    getReasonPhrase,
    getStatusCode, } = require('http-status-codes');
const {success,error} = require('../response');


async function customerauthorization(req, res, next) {
    let token = req.headers.authorization
    if (token) {
    token = token.split(" ")[1]
        jwt.verify(token, 'secret_key', (err, decoded) => {
            if (err) {
                error(req,res,401,err.message);
            } else {
                if (decoded.usertype == "customer") {
                    req.decoded = decoded;
                    next();
                } else {
                    error(req,res,403,"Access Denied");
                }
            }
        });
    } else {
        error(req,res,401,"JWT not provided")
        // res.status(401).json({
        //     status: getReasonPhrase(401),
        //     "status code": 401,
        //     error: true,
        //     "error message": "JWT not provided",
        //     response: {}
        // });
    }

}

async function adminauthorization(req, res, next) {
    let token = req.headers.authorization;
    if (token) {
    token = token.split(" ")[1];
        jwt.verify(token, 'secret_key', (err, decoded) => {
            if (err) {
                res.status(401).json({
                    status: getReasonPhrase(401),
                    "status code": 401,
                    error: true,
                    "error message": err.message,
                    response: {}
                })
            } else {
                if (decoded.usertype == "admin") {
                    req.decoded = decoded;
                    next();
                } else {
                    res.json({
                        status: getReasonPhrase(403),
                        "status code":403,
                        error:true,
                        "error message":"Access Denied",
                        response:{}
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

}

async function merchantauthorization(req, res, next) {

    let token = req.headers.authorization;
    if (token) {
    token = token.split(" ")[1];
        jwt.verify(token, 'secret_key', (err, decoded) => {
            if (err) {
                res.status(401).json({
                    status: getReasonPhrase(401),
                    "status code": 401,
                    error: true,
                    "error message": err.message,
                    response: {}
                })
            } else {
                if (decoded.usertype == "merchant") {
                    req.decoded = decoded;
                    next();
                } else {
                    res.json({
                        status: getReasonPhrase(403),
                        "status code":403,
                        error:true,
                        "error message":"Access Denied",
                        response:{}
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

}

module.exports = {
    customerauthorization,
    adminauthorization,
    merchantauthorization,
}