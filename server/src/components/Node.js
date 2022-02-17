import React from "react";
import MainContext from "../MainContext";
import { observer } from "mobx-react";
import * as THREE from "three";
import * as UI from "note-ui";
import TextData from "./data/TextData";
import AudioData from "./data/AudioData";
import { highContrastTextColor } from "../utils/ColorUtilities";
import { mapXYZToLatLong } from "../utils";

const Node = (props) => {
  const store = React.useContext(MainContext).store;
  const theme = React.useContext(UI.ThemeContext);

  const [dimensions, setDimensions] = React.useState([100, 100]);
  const [expanded, setExpanded] = React.useState(false);

  const wrapperElement = React.useRef(null);
  const canvasElement = React.useRef(null);

  const isSelected = store.selectedNode === props.node;

  const top = props.node.screenPosition.y + props.bounds.y;
  const left = props.node.screenPosition.x + props.bounds.x;

  const handlePinMove = (e) => {
    if (!props.node.pinned) return;
    let dragging = true;

    const handleMove = (e) => {
      if (e.touches) e = e.touches[0];

      if (e.pageY && dragging) {
        const pBounds = wrapperElement.current.getBoundingClientRect();

        let x = e.pageX;
        let y = e.pageY;

        props.node.setPinOffset([x, y]);
      }
    };

    const handleMoveEnd = (e) => {
      dragging = false;
      if (e.touches && e.touches[0]) e = e.touches[0];

      if (e.pageY) {
        const pBounds = wrapperElement.current.getBoundingClientRect();

        let x = e.pageX;
        let y = e.pageY;

        props.node.setPinOffset([x, y]);
      }

      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMoveEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleMoveEnd);
    };

    if (e.touches && e.touches[0]) e = e.touches[0];

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMoveEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleMoveEnd);
  };

  const handleResize = (e) => {
    let dragging = true;

    const handleMove = (e) => {
      if (e.touches) e = e.touches[0];

      if (e.pageY && dragging) {
        const pBounds = wrapperElement.current.getBoundingClientRect();

        let w = e.pageX - pBounds.x;
        let h = e.pageY - pBounds.y;

        setDimensions([w, h]);
      }
    };

    const handleMoveEnd = (e) => {
      dragging = false;
      if (e.touches && e.touches[0]) e = e.touches[0];

      if (e.pageY) {
        const pBounds = wrapperElement.current.getBoundingClientRect();

        let w = e.pageX - pBounds.x;
        let h = e.pageY - pBounds.y;
        setDimensions([w, h]);
      }

      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMoveEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleMoveEnd);
    };

    if (e.touches && e.touches[0]) e = e.touches[0];

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMoveEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleMoveEnd);
  };

  const handleNodeMove = (e) => {
    /* raycast mouse position and apply it when mouse is released */

    let dragging = true;

    const handleMove = (e) => {
      if (e.touches && e.touches[0]) e = e.touches[0];

      if (e.pageY) {
        // const pBounds = wrapperElement.current.getBoundingClientRect();

        let latLong;

        /* project from sphere */
        if (store.gl.viewer.viewType === "Globe") {
          latLong = mapXYZToLatLong(
            store.gl.viewer.cursor.position.x,
            store.gl.viewer.cursor.position.y,
            store.gl.viewer.cursor.position.z
          );
        }

        /* project from plane */
        if (store.gl.viewer.viewType === "Flat") {
          latLong = new THREE.Vector2(
            store.gl.viewer.cursor.position.x * 360,
            store.gl.viewer.cursor.position.y * 360
          );
        }

        props.node.setPosition(latLong);
      }
    };

    const handleMoveEnd = (e) => {
      dragging = false;
      if (e.touches && e.touches[0]) e = e.touches[0];

      if (e.pageY) {
        // const pBounds = wrapperElement.current.getBoundingClientRect();

        let latLong;

        /* project from sphere */
        if (store.gl.viewer.viewType === "Globe") {
          latLong = mapXYZToLatLong(
            store.gl.viewer.cursor.position.x,
            store.gl.viewer.cursor.position.y,
            store.gl.viewer.cursor.position.z
          );
        }

        /* project from plane */
        if (store.gl.viewer.viewType === "Flat") {
          latLong = new THREE.Vector2(
            store.gl.viewer.cursor.position.x * 360,
            store.gl.viewer.cursor.position.y * 360
          );
        }

        props.node.setPosition(latLong);
      }

      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMoveEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleMoveEnd);
    };

    if (e.touches && e.touches[0]) e = e.touches[0];

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleMoveEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleMoveEnd);
  };

  const toggleExpanded = (e) => {
    setExpanded((prev) => !prev);
  };

  const handleNodeTypeChange = (e) => {
    // props.node
  }

  /* 
    need to factor in the x / y offset that comes from the UI drawers
    needs to be relative to the canvas itself
  */
  React.useEffect(() => {
    if (!canvasElement.current) return;

    let ctx = canvasElement.current.getContext("2d");

    lineCanvasWidth = Math.abs(
      props.node.screenPosition.x - props.node.pinOffset[0]
    );
    lineCanvasHeight = Math.abs(
      props.node.screenPosition.y - props.node.pinOffset[1]
    );

    canvasElement.current.width = lineCanvasWidth;
    canvasElement.current.height = lineCanvasHeight;

    let a_x,
      a_y = 0;
    let b_x, b_y;

    if (
      // topLeft
      props.node.pinOffset[0] < props.node.screenPosition.x &&
      props.node.pinOffset[1] < props.node.screenPosition.y
    ) {
      a_x = 0;
      a_y = 0;
      b_x = canvasElement.current.width;
      b_y = canvasElement.current.height;
    } else if (
      // bottomLeft
      props.node.pinOffset[0] < props.node.screenPosition.x &&
      props.node.pinOffset[1] > props.node.screenPosition.y
    ) {
      a_x = 0;
      a_y = canvasElement.current.height;
      b_x = canvasElement.current.width;
      b_y = 0;
    } else if (
      // topRight
      props.node.pinOffset[0] > props.node.screenPosition.x &&
      props.node.pinOffset[1] < props.node.screenPosition.y
    ) {
      // ok
      a_x = 0;
      a_y = canvasElement.current.height;
      b_x = canvasElement.current.width;
      b_y = 0;
    } else if (
      // bottomRight
      props.node.pinOffset[0] > props.node.screenPosition.x &&
      props.node.pinOffset[1] > props.node.screenPosition.y
    ) {
      a_x = 0;
      a_y = 0;
      b_x = canvasElement.current.width;
      b_y = canvasElement.current.height;
    }

    ctx.strokeStyle = props.node.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a_x, a_y);
    ctx.lineTo(b_x, b_y);
    ctx.stroke();
  }, [canvasElement, props.node.pinOffset]);

  let lineCanvasWidth;
  let lineCanvasHeight;

  let lineCanvas = {};

  if (props.node.pinned && props.node.pinOffset) {
    lineCanvas.width =
      Math.abs(props.node.screenPosition.x - props.node.pinOffset[0]) + "px";
    lineCanvas.height =
      Math.abs(props.node.screenPosition.y - props.node.pinOffset[1]) + "px";

    // if (props.node.screenPosition.x < props.node.pinOffset[0]) {
    //   lineCanvas.right = -props.node.pinOffset[0];
    // } else {
    //   lineCanvas.left = props.node.pinOffset[0];
    // }

    if (
      // topLeft
      props.node.pinOffset[0] < props.node.screenPosition.x &&
      props.node.pinOffset[1] < props.node.screenPosition.y
    ) {
      lineCanvas.top = props.node.pinOffset[1];
      lineCanvas.left = props.node.pinOffset[0];
    } else if (
      // bottomLeft
      props.node.pinOffset[0] < props.node.screenPosition.x &&
      props.node.pinOffset[1] > props.node.screenPosition.y
    ) {
      lineCanvas.top =
        window.innerHeight - (window.innerHeight - props.node.screenPosition.y);
      lineCanvas.left = props.node.pinOffset[0];
    } else if (
      // topRight
      props.node.pinOffset[0] > props.node.screenPosition.x &&
      props.node.pinOffset[1] < props.node.screenPosition.y
    ) {
      lineCanvas.bottom = window.innerHeight - props.node.screenPosition.y;
      lineCanvas.left =
        window.innerWidth - (window.innerWidth - props.node.screenPosition.x);
    } else if (
      // bottomRight
      props.node.pinOffset[0] > props.node.screenPosition.x &&
      props.node.pinOffset[1] > props.node.screenPosition.y
    ) {
      lineCanvas.top =
        window.innerHeight - (window.innerHeight - props.node.screenPosition.y);
      lineCanvas.left =
        window.innerWidth - (window.innerWidth - props.node.screenPosition.x);
    }

    // console.log([lineCanvasWidth, lineCanvasHeight]);
  }

  return (
    <React.Fragment>
      {props.node.pinned && props.node.pinOffset && (
        <canvas
          style={{
            position: "absolute",
            ...lineCanvas,
          }}
          ref={canvasElement}
        />
      )}
      {/* node point */}
      <div
        style={{
          position: "absolute",
          top: top - 8,
          left: left - 8,
          zIndex: 0,
          backgroundColor: props.node.color,
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "1px solid " + theme.text_color,
          cursor: "move",
        }}
        onTouchStart={(e) => handleNodeMove(e)}
        onMouseDown={(e) => handleNodeMove(e)}
      ></div>
      <div
        className={props.node.label + "_LABEL"}
        style={{
          top:
            props.node.pinned && props.node.pinOffset
              ? props.node.pinOffset[1]
              : top,
          left:
            props.node.pinned && props.node.pinOffset
              ? props.node.pinOffset[0]
              : left,
          position: "absolute",
          backgroundColor: theme.background_color,
          color: "#602500",
          border: "4px double " + theme.text_color,
          boxShadow: isSelected ? "3px 3px 3px #602500" : "none",
          width: dimensions[0] + "px",
          // width: expanded ? dimensions[0] + "px" : "auto",
          height: expanded ? dimensions[1] + "px" : "auto",
          zIndex: isSelected ? 1 : 0,
          display: "flex",
          flexFlow: "column",
        }}
        onClick={() => store.selectNode(props.node)}
        ref={wrapperElement}
      >
        {/* node name */}
        <div
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            maxWidth: "100%",
            overflow: "hidden",
            backgroundColor: "lavender",
            fontWeight: "bolder",
            flexShrink: 0,
            backgroundColor: props.node.color,
            color: highContrastTextColor(props.node.color),
          }}
        >
          <div
            style={{ flexGrow: 2, marginRight: "15px" }}
            onTouchStart={(e) => handlePinMove(e)}
            onMouseDown={(e) => handlePinMove(e)}
          >
            {props.node.label}
          </div>

          <button
            style={{
              padding: "0px",
              backgroundColor: "transparent",
              border: "none",
              color: "inherit",
            }}
            onClick={(e) => toggleExpanded(e)}
          >
            {expanded ? "▾" : "▸"}
          </button>
        </div>

        {expanded && (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexFlow: "column",
              flexGrow: 2,
              borderTop: "1px solid " + theme.accent_color,
            }}
          >
            {/* buffer content */}
            <div
              style={{
                display: "block",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                overflow: "hidden",
                backgroundColor: "white",
                flexGrow: 2,
                padding: "2px",
              }}
            >
              {/* TODO this should be dependent on what type of data the node is holding */}
              {props.node.data.type === "String" && (
                <TextData node={props.node} />
              )}

              {props.node.data.type === "Audio" && (
                <AudioData node={props.node} />
              )}
            </div>

            {/* user row */}
            <div
              style={{
                display: "block",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                overflow: "hidden",
                backgroundColor: "lavender",
                borderTop: "1px solid " + theme.accent_color,
                flexShrink: 0,
              }}
            >
              @{props.node.user.username}
            </div>

            {/* resize handle */}
            <div
              style={{
                position: "absolute",
                height: "15px",
                width: "15px",
                border: "2px solid " + props.node.color,
                borderLeft: "none",
                borderTop: "none",
                cursor: "se-resize",
                bottom: "-3px",
                right: "-3px",
              }}
              onTouchStart={(e) => handleResize(e)}
              onMouseDown={(e) => handleResize(e)}
            ></div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default observer(Node);
