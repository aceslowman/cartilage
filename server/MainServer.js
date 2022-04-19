const path = require("path");
const express = require("express");
const app = express();
require("dotenv").config();
const ws = require("ws");
const NodeModel = require("./models/NodeModel");
const mainRouter = require("./routes/index.js");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const cors = require("cors");
const https = require("https");
app.use(cors());
const fs = require("fs");

/*  
  MainServer
*/

/* ----------------------------------------------------------------------------
  PORT ASSIGNMENT
*/
const port = 4000;

// const key = fs.readFileSync("./ca.key");
// const cert = fs.readFileSync("./ca.pem");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// const server = https
//   .createServer({ key: key, cert: cert }, app)
//   .listen(port, "0.0.0.0"); // ip is specific for docker

// const port = parseInt(process.env.PORT);
const server = app.listen(port, function () {
  console.log("main server listening on port " + port);
});

/* --------------------------------------------------------------------------
  SET UP WEBSOCKETS
*/

const wss = new ws.Server({ server });

let subscribers = new Map();

wss.on("connection", (ws) => {
  let id = undefined;
  console.log("initializing main server websocket connection");

  ws.on("message", async (m) => {
    let message = JSON.parse(m);
    // console.log("received message", message);

    switch (message.type) {
      /*  
        expected format

        {
          type: "subscriber_start_session" 
        }
      */
      case "subscriber_start_session":
        console.log("subscriber session started");
        /* generate subscriber session id */
        const subscriberId = nanoid();
        id = subscriberId;

        subscribers.set(subscriberId, {
          id: subscriberId,
          socket: ws,
          subscriberGroup: message.subscriberGroup,
        });

        /* send back the subscriber session id */
        ws.send(
          JSON.stringify({
            type: "subscriber_start_session_successful",
            subscriberSessionId: subscriberId,
            subscriberGroup: message.subscriberGroup,
          })
        );

        /* TODO
              as soon as a subscriber starts their session, start polling them
              every 10 minutes. if they fail to return a success message, 
              then end their session
        */

        break;
      case "subscriber_end_session":
        /* TODO this is not getting triggered when app closes */
        console.log("subscriber session ended");
        subscribers.delete(message.subscriberSessionId);
        break;
      case "update":
        /* receive update from node */
        buffer = message.data.content;

        // console.log("buffer", buffer);

        /* 
          update the node on the database 
          TODO need to look more into lazy updating
        */
        let result = await NodeModel.findByIdAndUpdate(message.selectedNode, {
          data: message.data,
        });

        result.markModified();
        break;
      case "broadcast":
        /* send along incoming message to all subscribers */
        if (message.subscriberGroup) {
          Array.from(subscribers.values())
            .filter((e) => e.subscriberGroup === message.subscriberGroup)
            .forEach((con) => {
              con.socket.send(JSON.stringify(message));
            });
        } else {
          subscribers.forEach((con) => {
            con.socket.send(JSON.stringify(message));
          });
        }

        break;
      default:
        console.log("message received without TYPE");
        break;
    }
  });

  ws.on("close", () => {
    console.log("deleting connection", id);
    /* update all clients with new peer count */
    subscribers.delete(id);
    subscribers.forEach((con) => {
      con.socket.send(
        JSON.stringify({
          type: "subscriber_left",
          subscriber_id: id,
        })
      );
    });
  });
});

/* ----------------------------------------------------------------
  SET UP DATABASE
*/
const initDatabase = async () => {
  console.log("initializing database");

  await mongoose.connect("mongodb://mongo:27017/test");
};

let db = mongoose.connection;
initDatabase();

db.once("open", () => {
  console.log("database connected");

  let nodeCollection = db.collection("nodes");

  const changeStream = nodeCollection.watch();

  changeStream.on("change", (next) => {
    let payload;

    switch (next.operationType) {
      case "update":
        payload = {
          type: next.operationType,
          nodeId: next.documentKey._id,
          updateDescription: next.updateDescription,
        };
        break;
      case "insert":
        payload = { type: next.operationType, node: next.fullDocument };
        break;
      case "delete":
        payload = { type: next.operationType, nodeId: next.documentKey._id };
        break;
    }

    subscribers.forEach((con) => {
      con.socket.send(JSON.stringify(payload));
    });
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

/* ---------------------------------------------------------------
  API ROUTES
*/

app.use("/api/v1", mainRouter);

const staticPath = path.join(__dirname, "/public");

app.use(express.static(staticPath));
