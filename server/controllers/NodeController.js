const { NodeService, SessionService } = require("../services");

const NodeController = {
  getNodes: async (req, res) => {
    try {
      let result = await NodeService.getNodes();
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  getNode: async (req, res) => {
    try {
      let result = await NodeService.getNode(req.params.nodeId);
      res.send(result);
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  addNode: async (req, res) => {
    try {
      let authSession = await SessionService.authenticateSession(
        req.headers.authorization.split(" ")[1]
      );

      /* match user and session token */
      if (
        authSession.status === "OK" &&
        authSession.user._id.toString() === req.body.userId
      ) {
        let result = await NodeService.addNode(
          req.body.label,
          req.body.userId,
          req.body.dataType,
          /* for now using an empty vector */
          req.body.position !== null ? req.body.position : { x: 0.0, y: 0.0 }
        );
        res.send(result);
      } else {
        console.error("session was invalid");
        res.sendStatus(500);
      }
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  removeNode: async (req, res) => {
    try {
      let authSession = await SessionService.authenticateSession(
        req.headers.authorization.split(" ")[1]
      );
      let node = await NodeService.getNode(req.params.nodeId);
      /* match user and session token */
      if (
        authSession.status === "OK" &&
        authSession.user._id.toString() === node.node.userId
      ) {
        let result = await NodeService.removeNode(req.params.nodeId);
        res.send(result);
      } else {
        console.error("session was invalid");
        res.sendStatus(500);
      }
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  updateNode: async (req, res) => {
    try {
      let authSession = await SessionService.authenticateSession(
        req.headers.authorization.split(" ")[1]
      );
      let node = await NodeService.getNode(req.params.nodeId);
      /* match user and session token */
      if (
        authSession.status === "OK" &&
        authSession.user._id.toString() === node.node.userId
      ) {
        let result = await NodeService.updateNode(req.params.nodeId, req.body);
        res.send(result);
      } else {
        console.error("session was invalid");
        res.sendStatus(500);
      }
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
  updateNodeWithBinary: async (req, res) => {
    console.log("updating files", req.file);
    console.log("updating body", req.body);
    /* file is coming in at req.file */
    /* file needs to be saved with gridfs */
    /* ideally all files over 16 mb will be handled by gridfs 
    and all under 16 mb will use BinData in a document */
    /*  
    {
      fieldname: 'data',
      originalname: 'testFile.webp',
      encoding: '7bit',
      mimetype: 'audio/webm',
      id: new ObjectId("6200a015b332d45b9f351998"),
      filename: '4728df4d098368d04efecc81195d4d11',
      metadata: null,
      bucketName: 'fs',
      chunkSize: 261120,
      size: 44185,
      md5: undefined,
      uploadDate: 2022-02-07T04:29:09.190Z,
      contentType: 'audio/webm'
    }
    */
    try {
      let authSession = await SessionService.authenticateSession(
        req.headers.authorization.split(" ")[1]
      );
      let node = await NodeService.getNode(req.body.nodeId);
      /* match user and session token */
      if (
        authSession.status === "OK" &&
        authSession.user._id.toString() === node.node.userId
      ) {
        let result = await NodeService.updateNode(req.body.nodeId, {data: {type: "Audio", content: req.file}});
        res.send(result);
      } else {
        console.error("session was invalid");
        res.sendStatus(500);
      }
    } catch (e) {
      console.error(e.message);
      res.sendStatus(500);
    }
  },
};

module.exports = NodeController;
