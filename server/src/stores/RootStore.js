import { types, flow, getSnapshot } from "mobx-state-tree";
import GLStore from "./GLStore";
import * as THREE from "three";
import * as cartilage from "../cartilage";
import NodeStore from "./NodeStore";
import { FriendlyWebSocket } from "../utils/websocket.js";
import UserStore from "./UserStore";
import AlertStore from "./AlertStore";

const RootStore = types
  .model("RootStore", {
    user: types.maybe(types.safeReference(UserStore)),
    server: "",
    nodes: types.map(NodeStore),
    users: types.map(UserStore),
    selectedNode: types.maybe(types.safeReference(NodeStore)),
    gl: GLStore,
    subscriberSessionId: types.maybe(types.string),
    sessionToken: types.maybe(types.string),
    alerts: AlertStore,
  })
  .volatile(() => ({
    ready: false,
    rememberMe: false,
    websocket: null,
    host: "",
    protocol: "",
    port: 4000,
  }))
  .actions((self) => ({
    afterCreate: flow(function* () {
      /* get server URL */
      self.server = window.location.href;
      self.protocol = self.server.split("/")[0];
      self.host = self.server.split("/")[2].split(":")[0];

      /* start up web socket connection with main server */
      self.websocket = new FriendlyWebSocket({
        url: `wss://${self.host}:${self.port}`,
      });

      self.websocket.on("open", self.onConnectionOpen);
      self.websocket.on("message", self.onConnectionMessage);
      self.websocket.on("close", self.onConnectionClose);

      window.addEventListener("beforeunload", self.onWindowUnload);

      yield self.getAllUsersFromServer();
      yield self.getAllNodesFromServer();

      /* if there is an existing session token... */
      if (window.localStorage.getItem("sessionToken")) {
        self.sessionToken = window.localStorage.getItem("sessionToken");
        console.log("user remembered!", self.sessionToken);

        /* attempt to auth */
        self.authenticateSession();
      }
    }),

    onWindowUnload: () => {
      console.log("unload");
      if (self.websocket.readyState == WebSocket.OPEN) self.websocket.close();
    },

    onConnectionOpen: (ws) => {
      if (self.ready) return;
      self.websocket.send(JSON.stringify({ type: "subscriber_start_session" }));
    },

    onConnectionMessage: (m) => {
      let message = JSON.parse(m);
      let node;

      switch (message.type) {
        case "insert":
          console.log("a node has been added", message.node._id);
          self.nodes.put({
            ...message.node,
            user: message.node.userId,
          });
          self.gl.subscriber.update();
          break;
        case "delete":
          console.log("a node has been removed");
          self.nodes.delete(message.nodeId);
          self.gl.subscriber.update();
          break;
        case "update":
          node = self.nodes.get(message.nodeId);
          /* TODO this needs tweaks */
          node.setData(message.updateDescription.updatedFields.data);
          break;
        case "subscriber_start_session_successful":
          self.subscriberSessionId = message.subscriberSessionId;
          break;
      }
    },

    onConnectionClose: (e) => {
      /* TODO this is not getting triggered when app closes */
      console.log("closing websocket connection", e);
      self.websocket.send(
        JSON.stringify({
          type: "subscriber_end_session",
          subscriberSessionId: self.subscriberSessionId,
        })
      );
    },

    authenticateSession: flow(function* () {
      const result = yield cartilage.authenticateSession(
        self.sessionToken,
        self.host,
        self.port
      ).catch((err) => {
        self.alerts.setLoginAlert(err);
        // remove user's stored session, since it failed
        window.localStorage.removeItem("sessionToken");
      });

      if (result) {
        const { userId } = result;
        self.user = self.users.get(userId);
        self.alerts.setLoginAlert("Auth Successful!");
      }
    }),

    login: flow(function* (username, password) {
      const result = yield cartilage.login(
        username,
        password,
        self.host,
        self.port
      ).catch((err) => {
        console.log(err);
        self.alerts.setLoginAlert(err);
      });

      if (result) {
        const { sessionToken, userId } = result;

        self.sessionToken = sessionToken;
        self.user = self.users.get(userId);

        if (self.rememberMe) {
          window.localStorage.setItem("sessionToken", sessionToken);
        } else {
          window.localStorage.removeItem("sessionToken");
        }

        self.alerts.setLoginAlert("Login Successful!");
      }
    }),

    logout: flow(function* () {
      const result = yield cartilage.logout(
        self.sessionToken,
        self.host,
        self.port
      ).catch((err) => {
        console.log(err);
        self.alerts.setLoginAlert(err);
      });

      if (result) {
        self.sessionToken = undefined;
        self.user = undefined;

        window.localStorage.removeItem("sessionToken");

        self.alerts.setLoginAlert("Logout Successful!");
      }
    }),

    register: flow(function* (username, password) {
      const result = yield cartilage.register(
        username,
        password,
        self.host,
        self.port
      ).catch((err) => {
        console.log(err);
        self.alerts.setLoginAlert(err);
      });

      if (result) {
        const { sessionToken, userId } = result;

        // gotta pull in new users immediately
        yield self.getAllUsersFromServer();

        self.sessionToken = sessionToken;
        self.user = self.users.get(userId);

        if (self.rememberMe) {
          window.localStorage.setItem("sessionToken", sessionToken);
        } else {
          window.localStorage.removeItem("sessionToken");
        }

        self.alerts.setLoginAlert("Registration Successful!");
      }
    }),

    addNewNode: flow(function* (label = "Default", position = null) {
      if (!self.user) {
        console.log("you can't add a new node if you're not logged in");
        return;
      }

      if (!position) {
        position = new THREE.Vector2();
      }

      const result = yield cartilage.addNode(
        self.sessionToken,
        self.user._id,
        { position: position },
        self.host,
        self.port
      ).catch((err) => {
        console.log(err);
        // self.alerts.setMainAlert(err);
      });

      if (result) {
        console.log("node added");
        // self.alerts.setMainAlert("Successfully added node!");
      }
    }),

    deleteNode: flow(function* (n) {
      0;
      const result = yield cartilage.deleteNode(
        self.sessionToken,
        self.user._id,
        n._id,
        self.host,
        self.port
      ).catch((err) => {
        console.log(err);
        // self.alerts.setMainAlert(err);
      });

      if (result) {
        console.log("node deleted");
        // self.alerts.setMainAlert("Successfully deleted node!");
      }
    }),

    getAllNodesFromServer: flow(function* () {
      const nodes = yield cartilage.getAllNodes(self.host, self.port).catch(
        (err) => console.log(err)
      );

      if (nodes) {
        /* add all nodes to store */
        for (let node of nodes) {
          self.nodes.put({
            _id: node._id,
            user: self.users.get(node.userId),
            position: new THREE.Vector2(node.position.x, node.position.y),
            data: node.data,
            label: node.label,
            color: node.color,
            dateCreated: node.dateCreated,
          });
        }
      }

      /* generate new nodes for the display */
      self.gl.subscriber.update();
    }),

    getAllUsersFromServer: flow(function* () {
      const users = yield cartilage.getAllUsers(self.host, self.port).catch(
        (err) => console.log(err)
      );

      if (users) {
        /* add all nodes to store */
        for (let user of users) {
          self.users.put({
            _id: user._id,
            username: user.username,
          });
        }
      }
    }),

    selectNode: (n) => (self.selectedNode = n),
    setRememberMe: (v) => (self.rememberMe = v),
  }));

export default RootStore;
