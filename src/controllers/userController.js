const User = require("../models/User");

async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    await User.deleteOne({ _id: user._id });

    res.json({
      message: `${user.role} account ${user.username} deleted successfully.`,
      deletedUser: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      deletedCurrentSession: user.username === req.auth.username && user.role === req.auth.role
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  deleteUser
};
