module.exports = (sequelize,DataTypes)=>{
    const Merchant = sequelize.define("Merchant",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        merchantname:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false,
        },
        email:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false,
        },
        phone:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false,
        },
        GSTIN:{
            type:DataTypes.STRING,
            unique:true,
            allowNull:false
        },
        address:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        password:{
            type:DataTypes.STRING
        },
        status:{
            type:DataTypes.BOOLEAN,
            defaultValue:0
        }

    },{
        timestamps:false
    });
    return Merchant;
}