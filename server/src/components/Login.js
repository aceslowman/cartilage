import React from "react";
import MainContext from "../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";

const Login = (props) => {
  const store = React.useContext(MainContext).store;
  const [username, setUsername] = React.useState("Guest");
  const [password, setPassword] = React.useState("");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRememberMeToggle = (e) => {
    store.setRememberMe(e.target.checked);
  };

  return (
    <UI.Panel title="login">
      <UI.InputGroup>
        <UI.Label>
          username:
          <UI.TextInput
            style={{ width: "100%" }}
            value={username}
            onChange={handleUsernameChange}
          />
        </UI.Label>
        <UI.Label>
          password:
          <UI.PasswordInput
            style={{ width: "100%" }}
            value={password}
            onChange={handlePasswordChange}
          />
        </UI.Label>
      </UI.InputGroup>
      <UI.InputRow style={{ padding: "15px 0px" }}>
        <UI.Button onClick={() => store.login(username, password)}>
          Login
        </UI.Button>
        <UI.Button onClick={() => store.register(username, password)}>
          Register
        </UI.Button>
      </UI.InputRow>

      <UI.Label>
        remember me:
        <input type="checkbox" onChange={handleRememberMeToggle} />
      </UI.Label>

      <p style={{color:'red'}}>{store.alerts.loginAlert}</p>
    </UI.Panel>
  );
};

export default observer(Login);
