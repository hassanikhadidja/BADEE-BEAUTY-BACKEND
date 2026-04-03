const mongoose=require("mongoose")

const productSchema= new mongoose.Schema({
name:{type:String,require:[true, 'Le nom du produit est obligatoire']},
 brand: {
    type: String,
    default: 'BADEE BEAUTY',
    trim: true
  },
price:{type:Number,require:[true, 'Le prix est obligatoire'], min: [0, 'Le prix ne peut pas être négatif']},
discountPrice: {
    type: Number,
    min: [0, 'Le prix réduit ne peut pas être négatif']
  },
img:[ {
      type: String,
      default: "product image",
    },
],
description:{type:String,require:[true, 'La description est obligatoire']},
category: {
    type: String,
    enum: ['Makeup', 'Skincare', 'Haircare', 'Fragrance', 'Bodycare', 'Other'],
    required: true
  },
subCategory: {
    type: String,
    enum: [
      'Lips',
      'Face',
      'Eyes',
      'Foundation',
      'Skincare',
      'Serum',
      'Cleanser',
      'Moisturizer',
      'Mask',
      'Perfume',
      'Hair',
      'Body',
      'Other'
    ]
  },
 isAvailable: {
    type: Boolean,
    default: true
  },
    skinType: [
    {
      type: String,
      enum: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal', 'All']
    }
  ],
 benefits: [
    {
      type: String,
      trim: true
    }
  ],
  tags: [
    {
      type: String,
      trim: true
    }
  ],

rating:{type:Number,default:0,min: 0,
      max: 5},
},{ timestamps: true })// createdAt & updatedAt


const product=mongoose.model('product',productSchema)

module.exports=product