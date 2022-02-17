const NodeModel = require("../../../models/NodeModel");
const UserModel = require("../../../models/UserModel");
const SessionModel = require("../../../models/SessionModel");

const { nanoid } = require("nanoid");

class UserFactory {
  constructor() {
    this.users = [];
    this.sessions = [];

    this.loggedInUser = undefined;
    this.loggedInSessionToken = undefined;
  }
  async clear() {
    await UserModel.deleteMany({});
    await SessionModel.deleteMany({});
    this.users = [];
    this.sessions = [];
  }
  async generate(count) {
    for (let i = 0; i < count; i++) {
      let username = nanoid(5);
      let password = nanoid(5);

      let testUser = new UserModel({
        username: username,
        password: password,
      });

      /* also insert session */
      const testSession = new SessionModel({
        userId: testUser._id,
        timeStarted: Date.now(),
        sessionToken: nanoid(12),
      });

      /* retain plaintext and sessionToken for testing */
      this.users.push({
        sessionToken: testSession.sessionToken,
        ...testUser._doc
      });
      this.sessions.push(testSession);

      await testSession.save();
      await testUser.save();
    }
  }
  async loginRandomUser() {
    let username = this.getRandomUser().username;
    let password = this.getRandomUser().plaintextPassword;

    const matchedUser = await UserModel.findOne({
      username: username,
    });

    if (matchedUser) {
      let isMatch = await matchedUser.comparePassword(password);

      if (isMatch) {
        const session = new SessionModel({
          userId: matchedUser._id,
          timeStarted: Date.now(),
          sessionToken: nanoid(12),
        });

        const newSession = await session.save();

        this.loggedInSessionToken = newSession.sessionToken;
        this.loggedInUser = matchedUser;
      }
    }
  }
  getRandomUser() {
    return this.users[Math.floor(Math.random() * this.users.length)];
  }
  getRandomSession() {
    return this.sessions[Math.floor(Math.random() * this.sessions.length)];
  }
}

class NodeFactory {
  constructor() {
    this.nodes = [];
  }
  async clear() {
    await NodeModel.deleteMany({});
    this.nodes = [];
  }
  async generate(count, userPool) {
    for (let i = 0; i < count; i++) {
      const newNode = new NodeModel({
        label: nanoid(),
        userId: userPool[Math.floor(Math.random() * userPool.length)]._id,
        position: [0, 0],
        data: { type: Math.random() > 0.5 ? "String" : "Audio", content: "" },
      });

      this.nodes.push(newNode);
      await newNode.save();
    }
  }
  getRandomNode() {
    return this.nodes[Math.floor(Math.random() * this.nodes.length)];
  }
  getRandomNodeThatBelongsToUser(userId) {
    let candidates = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].userId.toString() === userId.toString())
        candidates.push(this.nodes[i]);
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
}

module.exports = {
  UserFactory,
  NodeFactory,
};
