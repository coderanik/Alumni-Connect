const jwt = require("jsonwebtoken");
const User = require("../Models/users");
const Alumni = require("../Models/alumni");

const protectRoute = async (req, res, next) => {
    try {
        console.log('ProtectRoute middleware called');
        console.log('Request path:', req.path);
        console.log('Request method:', req.method);
        console.log('Request headers:', req.headers);

        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
        console.log("Received token:", token);

        if (!token) {
            console.log('No token provided');
            return res.status(403).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        
        // Try to find user in both User and Alumni models
        let user = await User.findById(decoded.userId);
        if (!user) {
            user = await Alumni.findById(decoded.userId);
        }
        
        console.log("Found user:", user ? "Yes" : "No");
        
        if (!user) {
            console.log('User not found in database');
            return res.status(404).json({ message: "User not found." });
        }
        
        req.user = user;
        console.log('Middleware passed, proceeding to route handler');
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(400).json({ message: "Invalid token or user not found." });
    }
};

module.exports = protectRoute;
