const admin = require("./config/firebaseAdmin");

console.log("Firebase Admin initialized successfully");
console.log("Project ID:", admin.app().options.projectId);