const { UserService } = require("../services");

const decodeAuth = (header) => {
  const auth = Buffer.from(
    header.split(" ")[1],
    "base64"
  )
    .toString()
    .split(":");
  return auth;
}

const UserController = {
  getUsers: async (req, res) => {
    try {
      let result = await UserService.getUsers();
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  getUser: async (req, res) => {
    try {
      let result = await UserService.getUser(req.body.userId);
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  login: async (req, res) => {
    try {
      /* pull auth data from header */
      const [username, password] = decodeAuth(req.headers.authorization);
      console.log([username, password] )
      /* using Basic Authentication header for credentials */
      let result = await UserService.login(username, password);
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  logout: async (req, res) => {
    try {
      /* pull auth data from header */
      const sessionToken = req.headers.authorization.split(" ")[1];
      let result = await UserService.logout(sessionToken);
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  register: async (req, res) => {
    try {
      /* pull auth data from header */
      const [username, password] = decodeAuth(req.headers.authorization);
      /* using Basic Authentication header for credentials */
      let registration = await UserService.register(
        username,
        password
      );

      let result = await UserService.login(username, password);
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
};

module.exports = UserController;
