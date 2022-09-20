const {Sequelize,DataTypes} = require('sequelize');

const sequelize = new Sequelize("DB","root","pass",{
    host:'localhost',
    dialect:'mysql',
    logging:console.log,
    timezone:'+05:30'
});
sequelize.authenticate().then(()=>{
    console.log('Database connected successfully');
}).catch(()=>{
    console.log('Connection Failed');
});

const db = {}
db.sequelize = sequelize;
db.Sequelize= Sequelize;
db.Customer = require('./customer')(sequelize,DataTypes);
db.Otp = require('./otp')(sequelize,DataTypes);
db.Merchant = require('./merchant')(sequelize,DataTypes);
db.Customeraddress = require('./customeraddress')(sequelize,DataTypes);
db.Category = require('./category')(sequelize,DataTypes);
db.Subcategory = require('./subcategory')(sequelize,DataTypes);
db.Product = require('./product')(sequelize,DataTypes);
db.Cart = require('./cart')(sequelize,DataTypes);
db.Order = require('./order')(sequelize,DataTypes);
db.Orderhistory = require('./orderhistory')(sequelize,DataTypes);
db.Payment = require('./payment')(sequelize,DataTypes);

//associations

db.Customer.hasMany(db.Cart,{
    foreignKey:"customer_id"
});
db.Cart.belongsTo(db.Customer,{
    foreignKey:'customer_id'
});
db.Merchant.hasMany(db.Cart,{
    foreignKey:"merchant_id"
});
db.Cart.belongsTo(db.Merchant,{
    foreignKey:'merchant_id'
});
db.Product.hasMany(db.Cart,{
    foreignKey:'product_id'
});
db.Cart.belongsTo(db.Product,{
    foreignKey:'product_id'
})



db.Customer.hasMany(db.Customeraddress,{
    foreignKey:"customer_id"
});
db.Customeraddress.belongsTo(db.Customer,{
    foreignKey:"customer_id"
});



db.Category.hasMany(db.Subcategory,{
    foreignKey:'category_id'
});
db.Subcategory.belongsTo(db.Category,{
    foreignKey:'category_id'
});


db.Merchant.hasMany(db.Product,{
    foreignKey:'merchant_id'
});
db.Product.belongsTo(db.Merchant,{
    foreignKey:'merchant_id'
});

db.Category.hasMany(db.Product,{
    foreignKey:"category_id"
});
db.Product.belongsTo(db.Category,{
    foreignKey:"category_id"
});
db.Subcategory.hasMany(db.Product,{
    foreignKey:"subcategory_id"
});
db.Product.belongsTo(db.Subcategory,{
    foreignKey:'subcategory_id'
});



db.Customer.hasMany(db.Order,{
    foreignKey:'customer_id'
});
db.Order.belongsTo(db.Customer,{
    foreignKey:'customer_id'
});


db.Order.hasMany(db.Orderhistory,{
    foreignKey:'order_id'
});
db.Orderhistory.belongsTo(db.Order,{
    foreignKey:'order_id'
});
db.Merchant.hasMany(db.Orderhistory,{
    foreignKey:'merchant_id'
});
db.Orderhistory.belongsTo(db.Merchant,{
    foreignKey:'merchant_id'
});
db.Customer.hasMany(db.Orderhistory,{
    foreignKey:'customer_id'
});
db.Orderhistory.belongsTo(db.Customer,{
    foreignKey:'customer_id'
});


db.Customer.hasMany(db.Payment,{
    foreignKey:"customer"
});
db.Payment.belongsTo(db.Customer,{
    foreignKey:"customer"
});
db.Order.hasOne(db.Payment,{
    foreignKey:"order_id"
});
db.Payment.belongsTo(db.Order,{
    foreignKey:"order_id"
})



// db.Order.sync({force:true});
// db.Product.sync({force:true});
// db.Cart.sync({force:true})
// db.Subcategories.sync({force:true})
// db.Merchant.sync({force:true})
// db.Customer.sync({force:true});
// db.Customeraddress.sync({force:true});
// db.Products.sync({force:true});
// db.Orderhistory.sync({force:true});



db.sequelize.sync().then(()=>{
    console.log(`Models are synched with the source tables`);
}).catch((err)=>{
    console.log(`Error occured while syncing the models ${err}`);
})

module.exports = db;