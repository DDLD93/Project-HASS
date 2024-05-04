const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const authSchema = new mongoose.Schema(
  {
    // name: {
    //   type: String,
    // },
    // phone: {
    //   type: String,
    // },
    email: {
      index: true,
      unique: true,
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      validate: [
        (email) => /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email),
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      access_token: { type: String },
      refresh_token: { type: String },
      expiry_date: { type: Date },
    },
    role: {
      type: String,
      // required: [true, 'Role is required'],
      enum: ["patient", "doctor", "admin"],
    },
    authType: {
      type: String,
      required: [true, "Auth type is required"],
      enum: ["local"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["pending", "active", "disable"],
      default: "active"
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

authSchema.pre("save", function (next, opt) {
  let { isAdmin, skipHash } = opt;
  if (isAdmin) {
    this.role = "admin";
    this.isVerified = true;
  }



  if (skipHash) {
    console.log("Skipping password hash!!!");
    next();
  } else {
    bcrypt.hash(this.password, 10, async (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  }
});

// Method to check password validity
authSchema.methods.isValidPassword = function (password) {
  if (!this.password) {
    throw new Error("Password is not set for this user");
  }
  return bcrypt.compare(password, this.password);
};
authSchema.methods.changePassword = async function (password) {
  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) return err;
    this.password = hash;
    await this.save({ skipHash: true });
  });
};
authSchema.methods.verifyUser = async function () {
  if (this.isVerified) {
    throw new Error("User is already verified");
  }
  this.isVerified = true;
  await this.save();
  return;
};

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;
