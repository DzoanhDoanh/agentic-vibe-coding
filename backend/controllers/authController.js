const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "supersecretjwtkey_vibe_coding_mvp",
    {
      expiresIn: "30d",
    },
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug logs to help trace why User.findOne may return null

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailNormalized = (email || "").toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { login };
