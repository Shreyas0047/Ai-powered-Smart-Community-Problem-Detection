const { connectDatabase } = require("../src/config/db");
const Complaint = require("../src/models/Complaint");
const User = require("../src/models/User");
const { seedAll } = require("../src/services/seedService");
const { hashPassword } = require("../src/utils/auth");

async function run() {
  await connectDatabase();

  if (process.argv.includes("--fresh")) {
    await Promise.all([
      Complaint.deleteMany({}),
      User.deleteMany({})
    ]);
  }

  await seedAll();
  const userCount = await User.countDocuments();
  if (!userCount) {
    await User.insertMany([
      { username: "admin", passwordHash: hashPassword("admin123"), role: "Admin" },
      { username: "citizen", passwordHash: hashPassword("citizen123"), role: "Citizen" }
    ]);
  }
  console.log("MongoDB Atlas seed completed.");
  process.exit(0);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
