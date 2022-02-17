import React from "react";
import MainContext from "../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";

const UserItem = (props) => {
    const store = React.useContext(MainContext).store;
    const isSelected = store.selectedUser === props.data;  
  
    return (
      <UI.Panel
        style={{
          backgroundColor: isSelected ? "#602500" : "white",
          color: isSelected ? "white" : "#602500",
          boxShadow: isSelected ? "3px 3px 3px #602500" : "none",
          // whiteSpace: "nowrap",
          // textOverflow: "ellipsis",
          // overflow: "hidden",
        }}
        title={props.data.username}
      >
        <div
          style={{ display: "flex", flexFlow: "column" }}
          // onClick={() => store.selectUser(props.data)}
        >
          <div style={{}}>id: {props.data.id}</div>
        </div>
      </UI.Panel>
    );
  };

  export default observer(UserItem)