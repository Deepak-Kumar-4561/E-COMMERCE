module.exports = (sequelize,DataTypes)=>{
    const Cart = sequelize.define("Cart",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        hsncode:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        productname:{
            type:DataTypes.STRING,
            allowNull:false
        },
        quantity:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValues:1
        }
    },{
        timestamps:false
    });
    return Cart;
}