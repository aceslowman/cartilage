import { types, onSnapshot, getRoot, getSnapshot } from "mobx-state-tree";
import { Vector2Type } from "./CustomTypes";
import * as THREE from "three";
import UserStore from "./UserStore";

const NodeData = types.model("NodeData", {
  type: types.enumeration(["String", "Audio"]),
  content: types.frozen()
})
.actions((self) => ({
  setContent: (content) => {
    self.content = content;
  }
}))

const NodeStore = types
  .model("NodeStore", {
    _id: types.identifier,
    user: types.safeReference(UserStore),
    position: Vector2Type,
    label: types.string,
    data: NodeData,
    /* should be a date */
    dateCreated: types.string,
    color: types.string,
  })
  .volatile(() => ({
    screenPosition: null,
    visible: true,
    /* this should persist somehow but doesn't 
    need to be included in the database */
    pinned: true,
    pinOffset: false
  }))
  .actions((self) => ({
    afterCreate: () => {
      self.geometry = new THREE.SphereGeometry(0.05, 8, 8);
      self.material = new THREE.MeshBasicMaterial({ color: self.color });
      self.mesh = new THREE.Mesh(self.geometry, self.material);
      self.mesh.position.set(self.position.x, self.position.y);
    },

    sendUpdates: () => {
      /* TODO this should probably go somewhere else 
      TODO should send along label as well*/
      /* TODO this should send along the entire object */
      console.log('sending updates', getSnapshot(self))
      getRoot(self).websocket.send(
        JSON.stringify({
          type: "update",
          data: self.data,
          selectedNode: self._id,
          sessionToken: getRoot(self).sessionToken,
        })
      );
    },
    
    hide: () => (self.visible = false),
    show: () => (self.visible = true),
    setData: (v) => (self.data = v),
    
    setPosition: (p) => (self.position = p),
    
    setScreenPosition: (v) => (self.screenPosition = v),
    
    setLabel: (v) => (self.label = v),

    setPinOffset: (pinOffset) => {
      self.pinOffset = pinOffset;
    },

    setPinned: (b) => {
      self.pinned = b;
    }

  }));

export default NodeStore;
