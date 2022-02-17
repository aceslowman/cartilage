const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SessionSchema = new mongoose.Schema({
  userId: String,
  timeStarted: String,
  sessionToken: String
});

// SessionSchema.pre("save", function (next) {
//   const user = this;

//   if (this.isModified("password") || this.isNew) {
//     bcrypt.genSalt(10, function (saltError, salt) {
//       if (saltError) {
//         return next(saltError);
//       } else {
//         bcrypt.hash(user.password, salt, function (hashError, hash) {
//           if (hashError) {
//             return next(hashError);
//           }

//           user.password = hash;
//           next();
//         });
//       }
//     });
//   } else {
//     return next();
//   }
// });

SessionSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (error, isMatch) {
    if (error) {
      return cb(error);
    } else {
      cb(null, isMatch);
    }
  });
};

module.exports = mongoose.model("Session", SessionSchema);
