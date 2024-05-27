const jwt = require('jsonwebtoken');
const usersModel = require('../model/User')

const tokenVerfication = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) return res.status(401).json({ message: 'Missing token' });
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await usersModel.getByUsername(decoded.username)
		req.user = user;
		next();
	}
	catch (error) {
		console.log("unauthorized");
		return res.status(401).json({ message: 'auth.midl : unauthorized user'});
	}
};

module.exports = tokenVerfication;