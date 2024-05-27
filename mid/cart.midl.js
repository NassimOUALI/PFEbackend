

const cartVerification = async (req, res, next) => {
	try{

		if(!req.session.cart) return res.status(405).json({ message: 'missing cart' });

		next();
	}
	catch (error) {
		console.log("missing cart");
		return res.status(401).json({ message: 'cart.midl : unauthorized user'});
	}
}

module.exports = cartVerification