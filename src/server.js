const express = require('express');
// const stripe = require('stripe')("sk_test_51LezcFSD24HKNOPXkFMU6WjdGweGbsiWgXHu2kfw2LgwqLJXep7CodQwBM4ZhAywXhHNJDGZltVMUCX9Q5aKTrR500wSd25SIa")
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.listen(7788,()=>{
    console.log(
        `listening to the port 7788`
    );
});
// require('./model')
const customerroute = require('./routes/customer');
const merchantroute = require('../src/routes/merchant');
const adminroute = require('../src/routes/admin');
const commonroute = require('./routes/commonroutes');
const { razorpayorderID } = require('./controller/customer');

app.use('/common',commonroute);

app.use('/customer',customerroute);

app.use('/merchant',merchantroute);

app.use('/admin',adminroute);

app.get('generateorderID',razorpayorderID);

app.get('/',(req,res)=>{
    res.sendFile('index.html',{root:__dirname})
})




