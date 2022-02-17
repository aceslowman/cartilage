const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = require("chai");
require("dotenv").config({ path: "../../.env" });

const { UserFactory, NodeFactory } = require("../utils/factories");

const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const SessionModel = require("../../models/SessionModel");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
chai.use(chaiHttp);

let userFactory;
let nodeFactory;

before(async () => {
  await mongoose.connect(
    // `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/publicsphere?retryWrites=true&w=majority`
    "mongodb://localhost:27017/ps_test"
  );
  userFactory = new UserFactory();
  nodeFactory = new NodeFactory();
});

beforeEach(async () => {
  await userFactory.clear();
  await userFactory.generate(2);
  await nodeFactory.clear();
  await nodeFactory.generate(10, userFactory.users);
});

describe("SessionController", () => {
  describe("#authSession()", () => {
    it("should use authorization bearer", async () => {
      let session = userFactory.getRandomSession();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/authSession")
        .auth(session.sessionToken, { type: "bearer" });

      expect(res.body.status).to.equal("OK");
    });
    it("should complain if authorization bearer is not present", async () => {
      let session = userFactory.getRandomSession();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/authSession");

      expect(res).to.have.status(403);
    });
    it("should return false if token is expired", async () => {
      // edit timeStarted on the session
      let session = userFactory.getRandomSession();
      await SessionModel.findByIdAndUpdate(session._id, {
        timeStarted: Date.now() - 3 * 60 * 60 * 1000,
      });

      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/authSession")
        .auth(session.sessionToken, { type: "bearer" });

      expect(res.body.message).to.equal("session timed out!");
    });
    it("should delete an expired session", async () => {
      // edit timeStarted on the session
      let session = userFactory.getRandomSession();
      await SessionModel.findByIdAndUpdate(session._id, {
        timeStarted: Date.now() - 3 * 60 * 60 * 1000,
      });

      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/authSession")
        .auth(session.sessionToken, { type: "bearer" });

      let result = await SessionModel.findOne({ _id: session._id });

      expect(result).to.equal(null);
    });
    it("should return true if token is valid", async () => {
      let session = userFactory.getRandomSession();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/authSession")
        .auth(session.sessionToken, { type: "bearer" });
        
      expect(res.body.status).to.equal("OK");
    });
    it("should return false if token is NOT valid", async () => {
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/authSession")
        .auth(nanoid(5), { type: "bearer" });

      expect(res.body.status).to.equal("ERROR");
    });
  });
});

after(async () => {
  // await userFactory.clear();
  // await nodeFactory.clear();
});
