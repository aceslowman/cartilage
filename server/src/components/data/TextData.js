import React from "react";
import MainContext from "../../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";

const TextData = (props) => {
  const store = React.useContext(MainContext).store;
  const theme = React.useContext(UI.ThemeContext);

  const handleTextAreaInput = (e) => {
    props.node.setData({ type: "String", content: e.target.value });
    props.node.sendUpdates();
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      <textarea
        onInput={handleTextAreaInput}
        value={props.node.data.content}
        style={{
          border: "1px solid black",
          resize: "none",
          flexGrow: 2,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default observer(TextData);
