

const adminVerification = async (req, res, next) => {
	try{

		if(!req.user) return res.status(401).json({ message: 'Missing user var' });
		if(req.user.role != 'ADMIN') return res.status(401).json({ message: 'admin.midl : unauthorized user' });

		next();
	}
	catch (error) {
		console.log("unauthorized");
		return res.status(401).json({ message: 'admin.midl : unauthorized user'});
	}
}

module.exports = adminVerification