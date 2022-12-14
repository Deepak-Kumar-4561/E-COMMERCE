module.exports = (sequelize,DataTypes)=>{
    const Order = sequelize.define("Order",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        totalquantity:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        totaldiscount:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        subtotal:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        totaltax:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        shippingcharge:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        grandtotal:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        delieveryaddress:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        payment:{
            type:DataTypes.STRING,
            allowNull:false
        }
    });
    return Order;
}