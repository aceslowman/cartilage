const UserModel = require("../models/UserModel");
const SessionModel = require("../models/SessionModel");
const SessionService = require("./SessionService");

const UserService = {
  getUsers: async () => {
    try {
      let users = await UserModel.find().select('-password');
      return { status: "OK", users };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  getUser: async (id) => {
    try {
      let user = await UserModel.findById(id).select('-password');
      return { status: "OK", user };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  register: async (username, password) => {
    try {
      let usernameIsTaken = await UserModel.findOne({
        username: username,
      }).select('-password');

      if (!usernameIsTaken) {
        const user = new UserModel({
          username: username,
          password: password,
        });

        let newUser = await user.save();

        return { status: "OK", userId: newUser._id.toString() };
      } else {
        return { status: "ERROR", message: "username is not available" };
      }
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  login: async (username, password) => {
    try {
      const matchedUser = await UserModel.findOne({
        username,
      });
      
      if (matchedUser) {
        let isMatch = await matchedUser.comparePassword(password);        

        if (!isMatch) {
          return { status: "ERROR", message: "password does not match" };
        } else {
          /* 
            NOTE: 
            I wonder whether not I should move session
            generation out of this function 
          */
          let newSession = await SessionService.createSession(matchedUser._id);
          return {
            status: "OK",
            sessionToken: newSession.sessionToken,
            userId: matchedUser._id,
          };
        }
      } else {
        return { status: "ERROR", message: "user does not exist" };
      }
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  logout: async (sessionToken) => {
    try {
      const matchedSession = await SessionModel.findOneAndRemove({
        sessionToken: sessionToken,
      });

      return { status: "OK" };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
};

module.exports = UserService;
