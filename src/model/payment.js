module.exports = (sequelize,DataTypes)=>{
    const Payment = sequelize.define("Payment",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        customer_id:{
            type:DataTypes.STRING,
            allowNull:false
        },
        payment_id:{
            type:DataTypes.STRING,
            allowNull:false
        },
        payment_status:{
            type:DataTypes.STRING,
            allowNull:false
        },
    },{
        timestamps:false
    });
    return Payment;
}