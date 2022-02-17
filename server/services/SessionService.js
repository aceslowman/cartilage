const { nanoid } = require("nanoid");
const UserModel = require("../models/UserModel");
const SessionModel = require("../models/SessionModel");
const NodeModel = require("../models/NodeModel");

const SessionService = {
  createSession: async (userId) => {
    try {
      let matchedUser = await UserModel.findById(userId).select('-password');

      if (matchedUser) {
        const session = new SessionModel({
          userId: userId,
          timeStarted: Date.now(),
          sessionToken: nanoid(12),
        });

        const newSession = await session.save();
        return { status: "OK", sessionToken: newSession.sessionToken };
      } else {
        return { status: "ERROR", message: "user does not exist" };
      }
    } catch (e) {
      return {
        status: "ERROR",
        message: "there was an issue creating the session",
      };
    }
  },
  authenticateSession: async (sessionToken) => {
    try {
      const matched = await SessionModel.findOne({
        sessionToken,
      });

      if (matched) {
        const expireTime = 2; // hours
        const isExpired =
          matched.timeStarted < Date.now() - expireTime * 60 * 60 * 1000;

        if (!isExpired) {
          let user = await UserModel.findById(matched.userId).select('-password');
          let nodes = await NodeModel.find({ userId: user._id });
          // NOTE: get user's nodes as well, not sure if this is good form though
          return { status: "OK", user, nodes };
        } else {
          // remove session once it's expired
          await SessionModel.findByIdAndRemove(matched._id).exec();
          return { status: "ERROR", message: "session timed out!" };
        }
      } else {
        return { status: "ERROR", message: "session not found" };
      }
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  removeSession: async (sessionId) => {
    try {
      let deletedSession = await SessionModel.findByIdAndRemove(sessionId);
      return { status: "ERROR", deletedSession };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
};

module.exports = SessionService;
