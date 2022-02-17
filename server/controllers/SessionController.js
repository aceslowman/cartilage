const { SessionService } = require("../services");

const SessionController = {
  authSession: async (req, res) => {
    try {
      /* pull auth data from header */
      const sessionToken = req.headers.authorization.split(" ")[1];
      /* using Bearer Authentication header for credentials */
      let result = await SessionService.authenticateSession(
        sessionToken
      );
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
};

module.exports = SessionController;
