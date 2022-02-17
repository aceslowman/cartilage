const { NodeService, UserService, SessionService } = require("../../services");
const chai = require("chai");
const expect = chai.expect;
require("dotenv").config({ path: "../../.env" });

const { UserFactory, NodeFactory } = require("../utils/factories");

const NodeModel = require("../../models/NodeModel");
const UserModel = require("../../models/UserModel");
const SessionModel = require("../../models/SessionModel");

const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

let userFactory;
let nodeFactory;

before(async () => {
  await mongoose.connect(
    // `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/publicsphere?retryWrites=true&w=majority`
    'mongodb://localhost:27017/ps_test'
  );
  userFactory = new UserFactory();
  nodeFactory = new NodeFactory();
});

beforeEach(async () => {
  await userFactory.clear();
  await userFactory.generate(2);
  await nodeFactory.clear();
  await nodeFactory.generate(10);
  await userFactory.loginRandomUser();
});

describe("NodeService", () => {
  describe("#getNodes()", () => {
    it("should return the correct number of nodes", async () => {
      let result = await NodeService.getNodes();
      expect(result.nodes.length).to.equal(10);
    });
  });
  describe("#getNode()", () => {
    it("should return a new record with the correct format", async () => {
      let result = await NodeService.getNode(nodeFactory.getRandomNode()._id);
      result = JSON.parse(JSON.stringify(result));
      expect(result.node).to.include.keys(
        "__v",
        "_id",
        "label",
        "userId",
        "position",
        "data"
      );
    });
    it("should return an error if the node doesn't exist", async () => {
      let result = await NodeService.getNode(nanoid());
      result = JSON.parse(JSON.stringify(result));
      expect(result.status).to.eql("ERROR");
    });
  });
  describe("#addNode()", () => {
    it("should return a new record with the correct format", async () => {
      let result = await NodeService.addNode("TestHell", nanoid(5), "String", [0, 0]);
      result = JSON.parse(JSON.stringify(result));
      expect(result.node).to.include.keys(
        "__v",
        "_id",
        "label",
        "userId",
        "position",
        "data"
      );
    });
  });
  describe("#removeNode()", () => {
    it("should return the removed record", async () => {
      let nodeId = nodeFactory.getRandomNode()._id;
      let result = await NodeService.removeNode(nodeId);
      expect(result.deletedNode).to.be.an("object");
    });
    it("should decrease the node count if successful", async () => {
      let beforeCount = await NodeModel.find();
      beforeCount = beforeCount.length;
      let nodeId = nodeFactory.getRandomNode()._id;
      await NodeService.removeNode(nodeId);
      let afterCount = await NodeModel.find();
      afterCount = afterCount.length;
      expect(afterCount).to.equal(beforeCount - 1);
    });
    it("should throw an error if the node ID doesn't exist", async () => {
      let nodeId = nanoid();
      let result = await NodeService.removeNode(nodeId);
      expect(result.status).to.eql("ERROR");
    });
  });
  describe("#updateNode()", () => {
    it("should return the updated record", async () => {
      let nodeId = nodeFactory.getRandomNode()._id;
      let result = await NodeService.updateNode(nodeId, {
        label: "Something New",
      });
      expect(result.updatedNode.label).to.equal("Something New");
    });

    it("should properly update the relevant node", async () => {
      let nodeId = nodeFactory.getRandomNode()._id;
      let result = await NodeService.updateNode(nodeId, {
        label: "Something New",
      });
      // let result = await NodeModel.findById(nodeId);

      expect(result.updatedNode).to.include({
        label: "Something New",
      });
    });

    it("should throw an error if the node ID doesn't exist", async () => {
      let nodeId = nanoid();
      let updatedNode = await NodeService.updateNode(nodeId, {
        label: "Something New",
      });
      expect(updatedNode.status).to.eql("ERROR");
    });
  });
});

after(async () => {
  await userFactory.clear();
  await nodeFactory.clear();
});
