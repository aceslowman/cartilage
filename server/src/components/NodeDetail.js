import React from "react";
import MainContext from "../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";
import TextEdit from "./data/TextData";
import { highContrastTextColor } from "../utils/ColorUtilities";

const NodeItem = (props) => {
  const store = React.useContext(MainContext).store;
  const theme = React.useContext(UI.ThemeContext);
  const isSelected = store.selectedNode === props.data;

  const handleNodeLabelChange = (e) => {
    props.data.setLabel(e.target.value);
    props.data.sendUpdates();
  };

  const handleNodeDelete = (e) => {
    store.deleteNode(props.data);
  };

  return (
    <UI.Panel
      collapsible
      collapsed
      buttons={[
        props.editLabel && (
          <button key={"editLabel" + props.data._id} onClick={handleNodeDelete}>
            🗑
          </button>
        ),
      ]}
      style={{
        // backgroundColor: isSelected ? "#602500" : "white",
        // color: isSelected ? "white" : "#602500",
        boxShadow: isSelected ? "3px 3px 3px #602500" : "none",
        border: "4px double " + theme.text_color,
      }}
      title={
        props.editLabel ? (
          <input
            style={{
              width: "100%",
              border: "none",
              fontWeight: "bold",
              fontSize: "0.9em",
              backgroundColor: props.data.color,
              color: highContrastTextColor(props.data.color),
            }}
            value={props.data.label}
            onChange={handleNodeLabelChange}
          />
        ) : (
          <div
            style={{
              backgroundColor: props.data.color,
              color: highContrastTextColor(props.data.color),
            }}
          >
            {props.data.label}
          </div>
        )
      }
    >
      <div
        style={{ display: "flex", flexFlow: "column" }}
        onClick={() => store.selectNode(props.data)}
      >
        <div style={{}}>
          <em>{props.data.id}</em>
        </div>
        <div
          style={{
            backgroundColor: "white",
            width: "100%",
            // minHeight: "50px",
            // borderTop: "1px solid " + theme.accent_color,
          }}
        >
          {/* TODO this should be dependent on what type of data the node is holding */}
          {props.data.data.type === "String" && <TextEdit node={props.data} />}
        </div>

        <div
          style={{
            // borderTop: "1px solid " + theme.accent_color,
            // color: 'blue',
            // textDecoration: 'underline'
          }}
        >
          @{props.data.user.username}
        </div>
        <div>{props.data.dateCreated}</div>
      </div>
    </UI.Panel>
  );
};

export default observer(NodeItem);
