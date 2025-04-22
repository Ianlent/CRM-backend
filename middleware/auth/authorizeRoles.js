const authorizeRoles = (allowedRoles) => {
	return (req, res, next) => {
		const userRole = req.user?.user_role;
		if (!userRole || !allowedRoles.includes(userRole)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
};

export default authorizeRoles
  