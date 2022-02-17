import React from "react";
import MainContext from "../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";

const UserInfo = (props) => {
  const store = React.useContext(MainContext).store;

  return (
    <UI.Panel title={"hi "+store.user.username} collapsible>
      <div>
        user ID: <br />
        {store.user.id}
      </div>
      <br />
      <div>
        session token: <br />
        {store.sessionToken}
      </div>
      <UI.InputRow style={{ padding: "15px 0px" }}>
        <UI.Button onClick={() => store.logout()}>
          Logout
        </UI.Button>
      </UI.InputRow>
    </UI.Panel>
  );
};

export default observer(UserInfo);
