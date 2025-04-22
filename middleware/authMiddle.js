import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

	if (!token) return res.status(401).json({ message: 'Token missing' });

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: 'Invalid token' });

		req.user = user; // Attach decoded user to request
		next();
	});
};

export default authenticateToken;