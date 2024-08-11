const express = require('express');
const router = express.Router();
const isLoggedin=require("../middlewares/isLoggedin")
const productModel=require("../models/product-model");
const userModel = require('../models/user-model');
const Order = require('../models/order-model'); 


router.get("/", async (req, res) => {
  let error = req.flash("error");
  var isLogged = req.user ? true : false;

  res.render("landing", { isLogged, error });
});
router.get("/signup",async(req,res)=>{
  let error=req.flash("error")
  res.render("signup");
});
router.get("/login",async(req,res)=>{
  let error=req.flash("error")
  res.render("login");
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
router.post("/update-profile", isLoggedin, async function(req, res) {
  try {
      let { fullname, email, contact, Address } = req.body;
      let user = await userModel.findOneAndUpdate(
          { email: req.user.email }, 
          { 
              fullname: fullname,
              email: email,
              contact: contact,
              Address: Address
          }, 
          { new: true, runValidators: true }  // Return the updated document
      );

      
      if (user) {
          res.redirect('/profile');
      } else {
          req.flash('error', 'User not found');
          res.redirect('/profile');
      }
  } catch (error) {
      // Handle any errors that occur during the process
      console.error(error);
      req.flash('error', 'An error occurred while updating your profile');
      res.redirect('/profile');
  }
});
router.post('/checkout',isLoggedin,async (req, res) => {
  try {
      const userId = req.user._id; // Assuming you're using authentication and have the user's ID stored in req.user
      const items = [];

      // Iterate through the cart items to extract details
      for (let i = 0; i < req.user.cart.length; i++) {
          const itemId = req.body[`product_id_${i}`];
          const quantity = parseInt(req.body[`quantity_${i}`]);
          const price = parseFloat(req.body[`price_${i}`]);
          const total = parseFloat(req.body[`total_${i}`]);

          items.push({
              _id: itemId,
              price: price,
              quantity: quantity,
              total: total,
          });
      }

      const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

      // Create a new order document
      const order = new Order({
          user: userId,
          items: items,
          totalAmount: totalAmount,
          status: 'Pending', // Default status
      });

      // Save the order to the database
      await order.save();
      req.session.orderId = order._id;
      // Redirect to a confirmation page or the order summary
      res.redirect('/order-summary'); // Update this to the correct route
  } catch (error) {
      console.error('Error processing order:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.get('/order-summary', async (req, res) => {
  try {
      const orderId = req.session.orderId;
      if (!orderId) {
          return res.status(400).send('Order ID not found');
      }

      // Fetch the order details and populate the item details
      const order = await Order.findById(orderId)
        .populate({
          path: 'items._id',
          select: 'name', // Adjust fields as needed
        });

      if (!order) {
          return res.status(404).send('Order not found');
      }

      res.render('order-summary', { order });
  } catch (error) {
      console.error('Error fetching order summary:', error);
      res.status(500).send('Internal Server Error');
  }
});



module.exports = router;



