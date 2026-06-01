const User = require("../../models/User");

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "vamsidulam11@gmail.com" });

    if (existingAdmin) {
      return {
        success: true,
        message: "Admin user already exists",
        data: { email: existingAdmin.email },
      };
    }

    // Create admin user
    const adminUser = await User.create({
      email: "vamsidulam11@gmail.com",
      password: "Vamsidulam@2005121",
      role: "admin",
      isActive: true,
    });

    return {
      success: true,
      message: "Admin user created successfully",
      data: {
        id: String(adminUser._id),
        email: adminUser.email,
        role: adminUser.role,
      },
    };
  } catch (err) {
    console.error("Seed admin error:", err);
    throw err;
  }
}

module.exports = seedAdmin;
