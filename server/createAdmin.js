const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/user");

mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  try {
    const email = "admin@gmail.com";
    const password = "Admin@123";

    const existing = await User.findOne({ email });

    const hash = await bcrypt.hash(password, 10);

    if (existing) {
      existing.role = "admin";
      existing.password = hash;
      existing.isVerified = true;
      await existing.save();

      console.log("✅ Admin updated");
    } else {
        await User.create({
            name: "Admin",
            email: "admin@gmail.com",
            phone: "9999999999", 
            password: hash,
            role: "admin",
            isVerified: true,
            isApproved: true,
          });

      console.log("✅ Admin created");
    }

    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
}

createAdmin();