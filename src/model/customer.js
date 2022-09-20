const bcrypt = require('bcrypt');
module.exports = (sequelize,DataTypes)=>{
    const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    usertype:{
        type:DataTypes.STRING,
        defaultValue:'customer'
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
        
    },
    status:{
        type:DataTypes.INTEGER,
        defaultValue:0
    }

},{
    timestamps:false
});
return Customer;
}

