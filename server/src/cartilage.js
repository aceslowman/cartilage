/* 0.1.0 */

async function getAllUsers(host = "127.0.0.1", port = 4000) {
  const res = await fetch(`https://${host}:${port}/api/v1/getUsers`);
  const result = await res.json();

  switch (result.status) {
    case "OK":
      return result.users;
    case "ERROR":
      throw result.message;
  }
}

async function getAllNodes(host = "127.0.0.1", port = 4000) {
  /* send a GET request to retrieve all nodes from the server */
  const res = await fetch(`https://${host}:${port}/api/v1/getNodes`);
  const result = await res.json();

  switch (result.status) {
    case "OK":
      return result.nodes;
    case "ERROR":
      throw result.message;
  }
}

async function deleteNode(
  sessionToken,
  userId,
  nodeId,
  host = "127.0.0.1",
  port = 4000
) {
  const res = await fetch(
    `https://${host}:${port}/api/v1/removeNode/${nodeId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        userId: userId,
        node: nodeId,
      }),
    }
  );

  const result = await res.json();

  switch (result.status) {
    case "OK":
      return true;
    case "ERROR":
      throw result.message;
  }
}

async function addNode(sessionToken, userId, data = {}, host = "127.0.0.1", port = 4000) {
  const res = await fetch(`https://${host}:${port}/api/v1/addNode`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      userId: userId,
      position: data.position || null,
      label: "label",
      dataType: "String",
    }),
  });

  const result = await res.json();

  switch (result.status) {
    case "OK":
      return true;
    case "ERROR":
      throw result.message;
  }
}

async function login(username, password, host = "127.0.0.1", port = 4000) {
  const res = await fetch(`https://${host}:${port}/api/v1/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(username + ":" + password)}`,
    },
  });

  const result = await res.json();

  switch (result.status) {
    case "OK":
      return {
        userId: result.userId,
        sessionToken: result.sessionToken,
      };
    case "ERROR":
      throw result.message;
  }
}

async function logout(sessionToken, host = "127.0.0.1", port = 4000) {
  const res = await fetch(`https://${host}:${port}/api/v1/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${self.sessionToken}`,
    },
  });

  const result = await res.json();

  switch (result.status) {
    case "OK":
      return true;
    case "ERROR":
      throw result.message;
  }
}

async function register(username, password, host = "127.0.0.1", port = 4000) {
  const res = await fetch(`https://${host}:${port}/api/v1/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(username + ":" + password)}`,
    },
  });

  const result = await res.json();

  switch (result.status) {
    case "OK":
      return {
        userId: result.userId,
        sessionToken: result.sessionToken,
      };
    case "ERROR":
      throw result.message;
  }
}

async function authenticateSession(
  sessionToken,
  host = "127.0.0.1",
  port = 4000
) {
  const res = await fetch(`https://${host}:${port}/api/v1/authSession`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  const result = await res.json();

  switch (result.status) {
    case "OK":
      /* TODO the server should return only the user ID */
      return { userId: result.user._id };
    case "ERROR":
      throw result.message;
  }
}

export {
  getAllUsers,
  getAllNodes,
  deleteNode,
  addNode,
  login,
  logout,
  register,
  authenticateSession,
};
