import React from "react";
import MainContext from "../../MainContext";
import { observer } from "mobx-react";
import * as UI from "note-ui";
import { useDropzone } from "react-dropzone";

const AudioData = (props) => {
  const store = React.useContext(MainContext).store;
  const theme = React.useContext(UI.ThemeContext);

  const onDrop = React.useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        // console.log(binaryStr);
        /* save this to the node */
        props.node.data.setContent(binaryStr);
        // props.node.setData({type: "Audio", content: binaryStr})
        props.node.sendUpdates()
      };
      // reader.readAsArrayBuffer(file);
      reader.readAsDataURL(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      style={{
        backgroundColor: "green",
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      {/* set up basic drag-and-drop for audio files */}
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
    </div>
  );
};

export default observer(AudioData);
