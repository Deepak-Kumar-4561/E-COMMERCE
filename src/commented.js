// let [data1,created] = await otps.findOrCreate({
            //     where:{
            //         [Sequelize.Op.and]:[
            //             {email:req.body.email},
            //             sequelize.where(sequelize.fn("timestampdiff",sequelize.literal("second"),sequelize.col("updatedAt"),sequelize.literal("CURRENT_TIMESTAMP")
            //             )),
            //                 {
            //                    [Sequelize.Op.gte]:300 
            //                 }
            //         ]
            //     },
            //     // where: {
            //     //     [Sequelize.Op.and] : [
            //     //         { email : req.body.email },
            //     //         sequelize.where(sequelize.fn('timestampdiff',sequelize.fn("NOW") , sequelize.col('updatedAt')), {
            //     //             [Sequelize.Op.gt] : 5 
            //     //         }) 
                        
            //     //     ]
            //     //     // sequelize.where(
            //     //     //     sequelize.fn(
            //     //     //         'timestampdiff', 
            //     //     //          sequelize.literal("minute"),
            //     //     //          sequelize.col('updatedAt'),
            //     //     //          sequelize.literal('CURRENT_TIMESTAMP')
            //     //     //     ), 
            //     //     //     {
            //     //     //         [Op.gte] : 5
            //     //     //     }
            //     //     // )
            //     // },
            //     defaults:{
            //         otp:1234
            //     }
            // });
            