const NotificationToken = require("../models/NotificationToken");
const admin = require("../config/firebaseAdmin");

// Register or update FCM token
exports.registerToken = async (req, res) => {
  try {
    const { token, platform = "web" } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid notification token is required",
      });
    }

    if (!["web", "android", "ios"].includes(platform)) {
      return res.status(400).json({
        success: false,
        message: "Invalid platform",
      });
    }

    // JWT payload mein user ID aam taur par id ya _id ho sakti hai
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in authentication token",
      });
    }

    await NotificationToken.findOneAndUpdate(
      { token },
      {
        $set: {
          userId,
          platform,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Notification token registered successfully",
    });
  } catch (error) {
    console.error("Register notification token error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register notification token",
    });
  }
};

exports.sendNotificationToUser = async (req, res) => {
    try {
      const { userId, title, body, data = {} } = req.body;
  
      if (!userId || !title || !body) {
        return res.status(400).json({
          success: false,
          message: "userId, title and body are required",
        });
      }
  
      const tokens = await NotificationToken.find({ userId });
  
      if (!tokens.length) {
        return res.status(404).json({
          success: false,
          message: "No notification tokens found for this user",
        });
      }
  
      
const results = await Promise.allSettled(
    tokens.map(async ({ token }) => {
      const messageId = await admin.messaging().send({
        token,
        notification: {
          title,
          body,
        },
        data: Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            String(value),
          ])
        ),
        webpush: {
          notification: {
            title,
            body,
            icon: "/favicon.ico",
          },
        },
      });
  
      console.log("FCM MESSAGE SENT SUCCESSFULLY:", messageId);
      return messageId;
    })
  );
  
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        "FCM notification failed:",
        result.reason?.code,
        result.reason?.message
      );
    }
  });
  

      results.forEach((result) => {
        if (result.status === "rejected") {
          console.error(
            "FCM notification failed:",
            result.reason?.code,
            result.reason?.message
          );
        }
      });
  
      const successCount = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
  
      const failureCount = results.length - successCount;
  
      return res.status(200).json({
        success: true,
        message: "Notification sending completed",
        successCount,
        failureCount,
      });
    } catch (error) {
      console.error("Send notification error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to send notification",
      });
    }
  };