import { types } from "mobx-state-tree";

const AlertStore = types
  .model("AlertStore", {
        
  })
  .volatile(() => ({
    loginAlert: "",
  }))
  .actions((self) => ({
    setLoginAlert: (v) => {
        self.loginAlert = v;
    }
  }));

export default AlertStore;
