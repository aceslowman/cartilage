import React from "react";
import MainContext from "../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";
import Login from "./Login";
import UserInfo from "./UserInfo";

const Settings = (props) => {
  const store = React.useContext(MainContext).store;

  const [drawerPosition, setDrawerPosition] = React.useState("left");

  React.useEffect(() => {
    const adjustDrawerPosition = (width, height) => {
      if (height < width) {
        setDrawerPosition("left");
      } else {
        setDrawerPosition("top");
      }
    }

    window.addEventListener("resize", (e) => {
      adjustDrawerPosition(window.innerWidth,  window.innerHeight);      
    });

    adjustDrawerPosition(window.innerWidth, window.innerHeight);
  }, [setDrawerPosition]);


  return (
    <UI.Drawer position={drawerPosition}>      
      {store.user ? <UserInfo /> : <Login />}

      <UI.Credits
        projectUrl=""
        projectName="NET VIEWER"
        authorUrl="https://linktr.ee/aceslowman"
        authorName="aceslowman"
      />
    </UI.Drawer>
  );
};

export default observer(Settings);
