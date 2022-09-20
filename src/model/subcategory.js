module.exports = (sequelize,DataTypes)=>{
    const Subcategory = sequelize.define("Subcategory",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        subcategoryname:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },{
        timestamps:false
    });
    return Subcategory;
}