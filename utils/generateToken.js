import jwt from "jsonwebtoken";

export const generateToken = (user) => {
	const payload = {
		user_id: user.user_id,
		username: user.username,
		user_role: user.user_role
	}
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};