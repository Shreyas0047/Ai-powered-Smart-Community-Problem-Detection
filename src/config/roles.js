const rolePermissions = {
  Admin: [
    "submit_complaint",
    "view_dashboard",
    "view_sensors",
    "reset_dashboard",
    "manage_alerts",
    "update_complaint_status",
    "delete_users"
  ],
  Citizen: ["submit_complaint", "view_personal_updates"]
};

module.exports = {
  rolePermissions
};
