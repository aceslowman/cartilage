import React from "react";
import Settings from "./components/Settings";
import Details from "./components/Details";
import ThreeCanvas from "./components/ThreeCanvas.js";
import * as UI from "note-ui";
import "note-ui/dist/index.css";
import { MainProvider } from "./MainContext";
// import tinykeys from "tinykeys";

const App = (props) => {
  const { store } = props;

  /* Q bindings if necessary */
  // React.useEffect(() => {
  //   tinykeys(window, {
  //     "Shift+D": () => {
  //       alert("The 'Shift' and 'd' keys were pressed at the same time")
  //     },
  //     "y e e t": () => {
  //       alert("The keys 'y', 'e', 'e', and 't' were pressed in order")
  //     },
  //     "$mod+KeyD": event => {
  //       event.preventDefault()
  //       alert("Either 'Control+d' or 'Meta+d' were pressed")
  //     },
  //   })
  // }, [])

  return (
    <UI.ThemeContext.Provider
      value={{
        text_color: "#670909",
        background_color: "#efe9e5",
        foreground_color: "#670909",
        accent_color: "#670909",
      }}
    >
      <MainProvider value={{ store: store }}>
        <Settings />
        <ThreeCanvas />
        <Details />
      </MainProvider>
    </UI.ThemeContext.Provider>
  );
};

export default App;
