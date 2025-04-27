const jwt = require("jsonwebtoken");
const User = require("../Models/users");

const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        console.log("Received token:", token);

        if (!token) {
            return res.status(403).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        
        const user = await User.findById(decoded.userId);
        console.log("Found user:", user ? "Yes" : "No");
        
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(400).json({ message: "Invalid token or user not found." });
    }
};

module.exports = protectRoute;
