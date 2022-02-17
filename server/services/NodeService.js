const NodeModel = require("../models/NodeModel");

/*  
  if node does not include a color it will be initialized 
  with one of the following
*/
const colors = [
  "rgb(255, 165, 1000)",
  "rgb(128, 0, 128)",
  "rgb(255, 0, 0)",
  "rgb(0, 0, 255)",
];

const NodeService = {
  getNodes: async () => {
    try {
      let nodes = await NodeModel.find();
      return { status: "OK", nodes };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  getNode: async (id) => {
    try {
      let node = await NodeModel.findById(id);
      return { status: "OK", node };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  addNode: async (label, userId, dataType, position) => {
    /*  
      NOTE: I'm on the fence about storing position in the way that I 
      currently am, seems like it should be optional on the network 
      configuration
    */
    try {
      let node = new NodeModel({
        label: label,
        userId: userId,
        position: position,
        data: { type: dataType, content: "" },
        dateCreated: Date.now(),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      node = await node.save();
      return { status: "OK", node };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  removeNode: async (nodeId) => {
    try { 
      let deletedNode = await NodeModel.findByIdAndRemove(nodeId);
      return { status: "OK", deletedNode };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
  updateNode: async (nodeId, data) => {
    /* TODO IMPORTANT this should obviously be much more constrained */
    try {
      let updatedNode = await NodeModel.findByIdAndUpdate(nodeId, data, {
        new: true,
      });
      return { status: "OK", updatedNode };
    } catch (e) {
      return { status: "ERROR", message: e.message };
    }
  },
};

module.exports = NodeService;
