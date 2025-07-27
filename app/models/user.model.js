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
    ADMIN: { type: Boolean, default: false },
    BROKER: { type: Boolean, default: false },
    SETTINGS: {
      orderEditable: {
        type: Boolean,
        default: false,
      },
    },
    AGENCY: { type: Boolean, default: false },
    AGENT_CD: { type: String, index: true },
    COMP_CD: { type: String, index: true, required: true },
    CLIENT_CD: { type: String, index: true, required: true },
  },
  {
    timestamps: true,
  }
);

// userSchema.index({ LORY_CD: "text", LORY_NO: "text" });

var User = mongoose.model("User", userSchema);

export default User;
