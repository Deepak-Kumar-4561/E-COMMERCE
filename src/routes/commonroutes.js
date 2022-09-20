const {validator} = require('../utilis');

const {login_schema} = require('../validation/customer');

const {showcategories,showsubcategories} = require('../controller/admin')
const {login} = require('../controller/customer');


const commonroutes = require('express').Router();

commonroutes.post('/login',validator(login_schema,"body"),login);

commonroutes.get('/showcategories',showcategories);
commonroutes.get('/showsubcategories',showsubcategories);

module.exports = commonroutes;

