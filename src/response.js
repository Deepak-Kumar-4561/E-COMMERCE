console.log('response-------')
function success(req,res,code,message,data){
    response ={
        success:true,
        status_code:code,
        message:message,
        result:data
    }
    return res.status(code).json(response);
}

function error(req,res,code,message,data){
    response = {
        success:false,
        status_code:code,
        message:message,
        result:data
    }
    return res.status(code).json(response);
}


module.exports = {
    success,
    error
}