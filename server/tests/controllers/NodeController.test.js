const chai = require("chai");
const chaiHttp = require("chai-http");
const { expect } = require("chai");
require("dotenv").config({ path: "../../.env" });

const { UserFactory, NodeFactory } = require("../utils/factories");

const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

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

describe("NodeController", () => {
  describe("#getNodes()", () => {
    it("should return the correct number of nodes", async () => {
      let res = await chai
        .request("https://127.0.0.1:4000")
        .get("/api/v1/getNodes");

      expect(res.body.nodes.length).to.equal(nodeFactory.nodes.length);
    });
  });
  describe("#getNode()", () => {
    it("should return a single node", async () => {
      let node = nodeFactory.getRandomNode();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .get("/api/v1/getNode/" + node._id);

      expect(res.body.node).to.include.keys("label", "userId", "position");
    });
    it("should return an error if id is NOT valid", async () => {
      let res = await chai
        .request("https://127.0.0.1:4000")
        .get("/api/v1/getNode/" + nanoid());

      expect(res.body.status).to.eql("ERROR");
    });
  });
  describe("#addNode()", () => {
    it("should return the new node if successful", async () => {
      let user = userFactory.getRandomUser();
      let sessionToken = user.sessionToken;

      let res = await chai
        .request("https://127.0.0.1:4000")
        .put("/api/v1/addNode")
        .auth(sessionToken, { type: "bearer" })
        .send({
          label: nanoid(),
          userId: user._id,
          position: [0, 0],
          data: { type: "String", content: "hello" },
        });

      expect(res.body.node).to.include.keys("label", "userId", "position");
    });
    it("should fail if the auth is invalid", async () => {
      let user = userFactory.getRandomUser();
      let sessionToken = user.sessionToken;

      let res = await chai
        .request("https://127.0.0.1:4000")
        .put("/api/v1/addNode")
        .auth(nanoid(), { type: "bearer" })
        .send({
          label: nanoid(),
          userId: user._id,
          position: [0, 0],
          data: { type: "String", content: "hello" },
        });

      expect(res).to.have.status(500);
    });
  });

  describe("#removeNode()", () => {
    it("should return the deleted node if successful", async () => {
      let user = userFactory.getRandomUser();
      let sessionToken = user.sessionToken;

      let node = nodeFactory.getRandomNodeThatBelongsToUser(user._id);
      let res = await chai
        .request("https://127.0.0.1:4000")
        .delete("/api/v1/removeNode/" + node._id)
        .auth(sessionToken, { type: "bearer" });

      expect(res.body.deletedNode._id).to.equal(node._id.toString());
    });
    it("should fail if auth is invalid", async () => {
      let user = userFactory.getRandomUser();
      let sessionToken = user.sessionToken;

      let node = nodeFactory.getRandomNode();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .delete("/api/v1/removeNode/" + node._id)
        .auth(nanoid(), { type: "bearer" });

        expect(res).to.have.status(500);
    });
  });
  describe("#updateNode()", () => {
    it("should return the updated node", async () => {
      let user = userFactory.getRandomUser();
      let sessionToken = user.sessionToken;

      let node = nodeFactory.getRandomNodeThatBelongsToUser(user._id);
      let res = await chai
        .request("https://127.0.0.1:4000")
        .patch("/api/v1/updateNode/" + node._id)
        .auth(sessionToken, { type: "bearer" })
        .send({ label: "newLabel" });

      expect(res.body.updatedNode.label).to.equal("newLabel");
    });
    it("should fail if auth is invalid", async () => {
      let user = userFactory.getRandomUser();
      let sessionToken = user.sessionToken;

      let node = nodeFactory.getRandomNodeThatBelongsToUser(user._id);
      let res = await chai
        .request("https://127.0.0.1:4000")
        .patch("/api/v1/updateNode/" + node._id)
        .auth(nanoid(), { type: "bearer" })
        .send({ label: "newLabel" });

        expect(res).to.have.status(500);
    });
  });
});

after(async () => {
  // console.log("tear down");
});
