module.exports = (sequelize,DataTypes)=>{
    const Category = sequelize.define("Category",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        categoryname:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },{
        timestamps:false
    }
    );
    return Category;
}