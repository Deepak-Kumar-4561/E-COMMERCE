module.exports = (sequelize,DataTypes)=>{
    const Orderhistory = sequelize.define("Orderhistory",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
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
            allowNull:false
        },
        rate:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        discount:{
            type:DataTypes.DECIMAL(10,2),
            defaultValues:0
        },
        sellingprice:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        amount:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        }
    });
    return Orderhistory;
}