const ProduitModel = require('../model/Product')


class CartController {


	static addToCart(req, res) {
		const { productId, quantity } = req.body;

		if (!req.session.cart) {
			req.session.cart = {};
		}

		if (req.session.cart[productId]) {
			req.session.cart[productId] = quantity + req.session.cart[productId];
		} else {
			req.session.cart[productId] = quantity;
		}

		res.send("Product added to your cart successfully!");
	}

	static async getSessionCart(req, res) {
		if (!req.session.cart) {
			res.send([]);
		} else {
			try {
				// Convert cart object to an array of promises to fetch product details
				const cartPromises = Object.entries(req.session.cart).map(async ([productId, quantity]) => {
					const productDetails = await ProduitModel.getById(productId);
					if (!productDetails) {
						throw new Error(`No product found for ID: ${productId}`);
					}
					return {
						product: productDetails,
						quantity: quantity
					};
				});

				// Resolve all promises to get full cart details
				const fullCartDetails = await Promise.all(cartPromises);
				req.session.fullCartDetails = fullCartDetails
				res.send(fullCartDetails);
			} catch (error) {
				console.error('Failed to retrieve product details:', error);
				res.status(500).send('Failed to retrieve cart details');
			}
		}
	}

	static clear(req, res){

		delete req.session.cart;
		res.send("cart cleared")


	}

	static removeFromCart(req, res) {

    const { productId } = req.body;

    if (!req.session.cart) {
        return res.status(400).send('Your cart is empty.');
    }

    if (!req.session.cart[productId]) {
        return res.status(404).send('Product not found in the cart.');
    }

    delete req.session.cart[productId];

    if (Object.keys(req.session.cart).length === 0) {
        delete req.session.cart;
    }

    res.send('Product removed from your cart successfully!');
	}

	static async changeQuantity(req, res) {
    const { productId, quantity } = req.body;

    if (!req.session.cart) {
        return res.status(400).send('No cart found.');
    }

    // Check if the product exists in the cart
    if (!req.session.cart[productId]) {
        return res.status(404).send('Product not found in cart.');
    }

    // Validate the quantity
    const updatedQuantity = parseInt(quantity, 10);
    if (isNaN(updatedQuantity) || updatedQuantity < 1) {
        return res.status(400).send('Invalid quantity.');
    }

    // Update the quantity
    req.session.cart[productId] = updatedQuantity;

    res.send("Product updated in cart successfully!");

	}

	

}

module.exports = CartController
