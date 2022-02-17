import { types } from "mobx-state-tree";

/*  
  User

  id: this is the persistent user id
  username: the human readable account name
*/

const UserStore = types
  .model("UserStore", {
    _id: types.identifier,
    username: types.string
  })
  .volatile(() => ({
    currentlyLoggedIn: false,
  }))
  .actions((self) => ({
    afterCreate: () => {
      
    },
    setUsername: (v) => {
      self.username = v;
    }
  }));

export default UserStore;
