module.exports = (sequelize,DataTypes)=>{
    const Address = sequelize.define("Address",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        addressLine:{
            type:DataTypes.STRING,
            allowNull:false
        },
        pin_code:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        city:{
            type:DataTypes.STRING,
            allowNull:false
        },
        state:{
            type:DataTypes.STRING,
            allowNull:false
        },
    },{
        timestamps:false
    });
    return Address;
}