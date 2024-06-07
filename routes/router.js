const UserController = require("../controller/UserController");
const ProductController = require("../controller/ProductController");
const CategoryController = require("../controller/CategoryController");
const CartController = require('../controller/CartController');
const CheckoutController = require('../controller/CheckoutController');
const tokenVerfication = require("../mid/auth.midl");
const adminVerification = require("../mid/admin.midl");
const cartVerification = require("../mid/cart.midl");

const router = require("express").Router();

router.post("/user/adduser", UserController.addUser); // sign up
router.post("/user/getuser", tokenVerfication, UserController.getByUsername);// get user date
router.post("/user/login", UserController.login); // login
router.get("/user/logout",tokenVerfication, UserController.logout); // logout
router.get("/user/isLogged",tokenVerfication, UserController.isLogged); // checking login status
router.post("/user/OTP/login",UserController.loginEmail);
router.post("/user/OTP/sendOTP",UserController.sendOTP);
router.post("/user/OTP/changepass",tokenVerfication, UserController.changePass);


router.get("/admin/reviewcommande",tokenVerfication, adminVerification, UserController.getReviewCommande); // get commandes to review
router.post("/admin/reviewcommande/validate",tokenVerfication, adminVerification, UserController.validateCommande); // validate a commande
router.post("/admin/reviewcommande/refuse",tokenVerfication, adminVerification, UserController.refuseCommande); // refuse a commande
router.get("/admin/historique",tokenVerfication, adminVerification, UserController.getReviewedByAdmin)
router.get("/admin/recent",tokenVerfication, adminVerification, UserController.getRecent)
router.get("/admin/numcommande",tokenVerfication, adminVerification, UserController.numCommande)
router.get("/admin/getallusers",tokenVerfication, adminVerification, UserController.getAll); // getting all users
router.post("/admin/deleteuser",tokenVerfication, adminVerification, UserController.deleteUser); // deleting a user (not really used)
router.post("/admin/promoteuser",tokenVerfication, adminVerification, UserController.promoteuser); // deleting a user (not really used)
router.post("/admin/demoteuser",tokenVerfication, adminVerification, UserController.demoteuser); // deleting a user (not really used)

router.post("/cart/add-to-cart", CartController.addToCart); // add element to cart (uses sessions)
router.post("/cart/change-quantity", cartVerification, CartController.changeQuantity); // change the quantity of an element in the cart (uses sessions)
router.get("/cart/get-session-cart", CartController.getSessionCart); // get the cart to display
router.post("/cart/remove-from-cart", cartVerification, CartController.removeFromCart); // romeves item from cart
router.get("/cart/clear", CartController.clear); // clears the cart (session.cart)

router.post("/checkout/checkout-session", cartVerification, CheckoutController.confirm); // makes a checkout session using Stripe
router.get("/checkout/saveCommand", cartVerification, CheckoutController.saveCommande); // saves the commande, commande lines, and payment associated with it
router.get("/checkout/receipt",CheckoutController.getReceipt); // gets the receipt with it

router.get("/commande/getByClient",tokenVerfication, UserController.getUserCommandes); // get the commandes that a user made
router.post("/commande/delete",tokenVerfication,UserController.deleteCommande);  // a user deleting the commande (only if it's pending review)

router.get("/produit/getall", ProductController.getAllProducts); // get all product list

router.get("/city/getall",UserController.getAllCityNames); // get all city names

router.get("/categorie/getall", CategoryController.getAllCategorys); // get all categories

// router.get("/checkout/paid", (req, res) => {
//   res.status(200).json({paid: req.session.paid})
// });

router.get("/", (req, res) => {
  res.send({Message : req.session})
});

module.exports = router;
