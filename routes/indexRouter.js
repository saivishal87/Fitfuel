const express = require('express');
const router = express.Router();
const isLoggedin=require("../middlewares/isLoggedin")
const productModel=require("../models/product-model");
const userModel = require('../models/user-model');

// Define routes for owners
router.get('/', (req, res) => {
    let error=req.flash("error")
    res.render('index', { error,loggedin:false}); // Ensure the view exists
});

router.get("/shop",isLoggedin,async function(req,res){
    let products=await productModel.find();
    let success=req.flash("success")
    res.render("shop",{products,success});
})
router.get("/cart",isLoggedin,async function(req,res){
    try {
        let usercart = await userModel.findOne({ email: req.user.email });
        if (usercart.cart.length === 0) {
          return res.redirect('/shop');
        }
        let user=await userModel.findOne({email:req.user.email}).populate("cart");
        res.render("cart",{user});
      } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect('/shop');
      }
    
})
router.get("/addtocart/:productid",isLoggedin,async function(req,res){
    try {
        // Find the user based on their email
        let user = await userModel.findOne({ email: req.user.email });
    
        // Check if the product is already in the cart
        if (user.cart.includes(req.params.productid)) {
          req.flash("success", "Product already Added to the cart");
        } else {
          // Add the product to the cart and save
          user.cart.push(req.params.productid);
          await user.save();
          req.flash("success", "Added to cart");
        }
    
        // Redirect to the shop page
        res.redirect("/shop");
      } catch (error) {
        console.error("Error adding product to cart:", error);
        req.flash("error", "An error occurred while adding the product to the cart");
        res.redirect("/shop");
      }
});
router.post('/removefromcart/:productid', isLoggedin, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/cart");
    }
    user.cart = user.cart.filter(item => item._id.toString() !== req.params.productid);
    await user.save();
    res.redirect("/cart");
  } catch (err) {
    console.error('Error removing item from cart:', err);
    req.flash("error", "Something went wrong");
    res.redirect("/cart");
  }
});

router.get("/profile", isLoggedin, async (req, res) => {
  try {
      const user = await userModel.findOne({ email: req.user.email });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.render('profile', { user });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;