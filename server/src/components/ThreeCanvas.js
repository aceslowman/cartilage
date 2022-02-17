import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import useResizeObserver from "./hooks/ResizeHook";
import MainContext from "../MainContext";
import * as UI from "note-ui";
import { getSnapshot } from "mobx-state-tree";
import { observer } from "mobx-react";
import Node from "./Node";
import styles from "./ThreeCanvas.module.css";
import { createKeybindingsHandler }  from "tinykeys";

const ThreeCanvas = (props) => {
  const store = React.useContext(MainContext).store;
  const theme = React.useContext(UI.ThemeContext);
  const container = React.useRef();
  const canvas_ref = React.useRef();

  const [ready, setReady] = React.useState(false);

  useResizeObserver(
    () => {
      if (!ready) return;
      let bounds = container.current.getBoundingClientRect();

      let w = Math.round(bounds.width);
      let h = Math.round(bounds.height);

      store.gl.handleResize(w, h);
    },
    container,
    [ready, store]
  );

  /* set up all basic rendering */
  useLayoutEffect(() => {
    if (!ready && container.current) {
      store.gl.init(
        canvas_ref.current,
        container.current.getBoundingClientRect()
      );

      setReady(true);
    }
  }, [ready, setReady, container.current]);

  return (
    <div
    className={styles.wrapper}
      ref={container}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        userSelect: 'none'
      }}
    >
      <canvas ref={canvas_ref} />

      {store.nodes.size > 0 &&
        Array.from(store.nodes.values()).map((e, i) => {
          let bounds = container.current.getBoundingClientRect();
          // get screen position
          /* TODO optionally show when hovered over */
          return e.visible && e.screenPosition ? (
            <Node
              key={i}
              node={e}
              bounds={bounds}
            />
          ) : (
            ""
          );
        })}

      <div
        style={{
          position: "absolute",
          display: "flex",
          bottom: "0px",
          padding: "5px",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        <a
          style={{
            padding: "0px 5px",
            fontWeight:
              store.gl.viewer.viewType === "Globe" ? "bold" : "normal",
            border:
              store.gl.viewer.viewType === "Globe" ? "1px solid black" : "none",
          }}
          onClick={() => store.gl.viewer.setViewType("Globe")}
        >
          globe
        </a>
        <a
          style={{
            padding: "0px 5px",
            fontWeight: store.gl.viewer.viewType === "Flat" ? "bold" : "normal",
            border:
              store.gl.viewer.viewType === "Flat" ? "1px solid black" : "none",
          }}
          onClick={() => store.gl.viewer.setViewType("Flat")}
        >
          flat
        </a>
      </div>
    </div>
  );
};

export default observer(ThreeCanvas);
