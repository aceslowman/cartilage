const express = require("express");

/* TODO currently working on properly integrating gridfs */
const multer = require("multer");
const {GridFsStorage} = require('multer-gridfs-storage');

const url = 'mongodb://yourhost:27017/database';
const storage = new GridFsStorage({ url: "mongodb://mongo:27017/test" });
const upload = multer({storage});

const {
  UserController,
  NodeController,
  SessionController,
} = require("../controllers");

const checkForAuthorizationHeader = (req, res, next) => {
  console.log(req.headers);
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  } else {
    next();
  }
};

const router = express.Router();

router.get("/getUsers", UserController.getUsers);
router.get("/getNodes", NodeController.getNodes);
router.get("/getNode/:nodeId", NodeController.getNode);

// each of these require auth
router.use(checkForAuthorizationHeader);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/authSession", SessionController.authSession);
router.post("/logout", UserController.logout);
router.put("/addNode", NodeController.addNode);
router.delete("/removeNode/:nodeId", NodeController.removeNode);
router.patch("/updateNode/:nodeId", NodeController.updateNode);
router.patch(
  "/updateNodeWithBinary/:nodeId",
  upload.single("data"),
  NodeController.updateNodeWithBinary
);

module.exports = router;
