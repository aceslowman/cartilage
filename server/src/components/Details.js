import React from "react";
import MainContext from "../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";
import NodeDetail from "./NodeDetail";
import UserItem from "./UserItem";

const Details = (props) => {
  const store = React.useContext(MainContext).store;

  const [drawerPosition, setDrawerPosition] = React.useState("left");

  React.useEffect(() => {
    const adjustDrawerPosition = (width, height) => {
      if (height < width) {
        setDrawerPosition("right");
      } else {
        setDrawerPosition("bottom");
      }
    }

    window.addEventListener("resize", (e) => {
      adjustDrawerPosition(window.innerWidth,  window.innerHeight);      
    });

    adjustDrawerPosition(window.innerWidth, window.innerHeight);
  }, [setDrawerPosition]);

  return (
    <UI.Drawer position={drawerPosition}>
      <UI.Panel title="details" collapsible>
        {store.user && (
          <UI.Panel title="your nodes" collapsible>
            <div>
              <ul style={{ listStyleType: "none", padding: "0px" }}>
                {Array.from(store.nodes.values())
                  .filter((e) => e.user._id === store.user._id)
                  .map((e, i) => (
                    <li key={"your" + e._id}>
                      <NodeDetail data={e} editLabel />
                    </li>
                  ))}
              </ul>
            </div>
            <UI.Button onClick={store.addNewNode}>add new node</UI.Button>
            <UI.Button onClick={store.getAllNodesFromServer}>
              get all nodes
            </UI.Button>
          </UI.Panel>
        )}
        <UI.Panel title="all nodes" collapsible>
          <div>
            <ul style={{ listStyleType: "none", padding: "0px" }}>
              {Array.from(store.nodes.values()).map((e, i) => (
                <li key={e._id}>
                  <NodeDetail data={e} />
                </li>
              ))}
            </ul>
          </div>
        </UI.Panel>

        <UI.Panel title="all users" collapsible>
          <div>
            <ul style={{ listStyleType: "none", padding: "0px" }}>
              {Array.from(store.users.values()).map((e, i) => (
                <li key={e._id}>
                  <UserItem data={e} />
                </li>
              ))}
            </ul>
          </div>
        </UI.Panel>
      </UI.Panel>
    </UI.Drawer>
  );
};

export default observer(Details);
