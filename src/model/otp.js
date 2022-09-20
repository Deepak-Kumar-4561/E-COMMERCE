const Sequelize = require('sequelize');
module.exports = (sequelize,DataTypes)=>{
    const Otp= sequelize.define("Otp",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        email:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false
        },
        otp:{
            type:DataTypes.STRING,
            allowNull:false
        }
    });
    return Otp;
}