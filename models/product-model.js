const mongoose=require('mongoose')

const productSchema=mongoose.Schema({
    image:Buffer,
    name: String,
    price:Number,
    discount:{
        type:Number,
        default:0,
    },
    product_type:String,
    weight:String,

})

module.exports= mongoose.model("product",productSchema)