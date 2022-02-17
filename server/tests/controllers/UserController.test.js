const chai = require("chai");
const chaihttp = require("chai-http");
const { expect } = require("chai");
require("dotenv").config({ path: "../../.env" });

const { UserFactory, NodeFactory } = require("../utils/factories");

const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

chai.use(chaihttp);
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

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
  await nodeFactory.generate(10, userFactory.users);
});

describe("UserController", () => {
  describe("#getUsers()", () => {
    it("should return an array of objects", async () => {
      let res = await chai
        .request("https://127.0.0.1:4000")
        .get("/api/v1/getUsers");

      expect(res.body.users).to.be.an("array");
    });
    
    it("should return the correct number of nodes", async () => {
      let res = await chai
        .request("https://127.0.0.1:4000")
        .get("/api/v1/getUsers");

      expect(res.body.users.length).to.equal(userFactory.users.length);
    });
    it("should NOT return the password", async () => {
      let res = await chai
        .request("https://127.0.0.1:4000")
        .get("/api/v1/getUsers");

      expect(res.body.users[0].password).to.equal(undefined);
    });
  });
  describe("#login()", () => {
    it("should complain if credentials aren't supplied", async () => {
      let user = userFactory.getRandomUser();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/login")

        expect(res).to.have.status(403);
    });
    it("should use Basic Authentication header for credentials", async () => {
      let user = userFactory.getRandomUser();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/login")
        .auth(user.username, user.password)

      expect(res.body.sessionToken).to.be.a("string");
    });
    it("should return a new session token if successful", async () => {
      let user = userFactory.getRandomUser();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/login")
        .auth(user.username, user.password)

      expect(res.body.sessionToken).to.be.a("string");
    });
    it("should return an error if there is a problem", async () => {
      let user = userFactory.getRandomUser();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/login")
        .auth(user.username, nanoid())

      expect(res.body.status).to.eql("ERROR");
    });    
  });
  describe("#logout()", () => {
    it("should return a successful status if valid", async () => {
      let session = userFactory.getRandomSession();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/logout")
        .auth(session.sessionToken, { type: "bearer" });
      
      expect(res).to.have.status(200);
    });
  });
  describe("#register()", () => {
    it("should complain if credentials aren't supplied", async () => {
      let user = userFactory.getRandomUser();
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/register")
        // .auth(nanoid(5), nanoid(5))

        // console.log(res)

        expect(res).to.have.status(403);
    });
    it("should return a successful status if valid", async () => {
      let res = await chai
        .request("https://127.0.0.1:4000")
        .post("/api/v1/register")
        .auth(nanoid(5), nanoid(5))
      
      expect(res).to.have.status(200);
    });
  });
});

after(async () => {
  // console.log("tear down");
});
