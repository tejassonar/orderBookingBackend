import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    FIRST_NAME: String,
    LAST_NAME: String,
    EMAIL: {
      type: String,
      unique: true,
      required: [true, "Please add an email"],
    },
    PASSWORD: String,
    PHONE_NUMBER: String,
    COMPANY_CODE: { type: String, index: true },
    CLIENT_CODE: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

// userSchema.index({ LORY_CD: "text", LORY_NO: "text" });

var User = mongoose.model("User", userSchema);

export default User;
