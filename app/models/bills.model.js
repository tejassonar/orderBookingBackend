import mongoose from "mongoose";

const billSchema = mongoose.Schema(
  {
    DOC_NO: {
      type: String,
      unique: true,
      required: [true, "Please add a DOC_NO"],
    },
    DOC_DT: Date,
    BIL_AMT: Number,
    PND_AMT: Number,
    PARTY_CD: String,
    AGENT_CD: { type: String, index: true },
    COMP_CD: { type: String, index: true, required: true },
    CLIENT_CD: { type: String, index: true, required: true },
  },
  {
    timestamps: true,
  }
);

// userSchema.index({ LORY_CD: "text", LORY_NO: "text" });

var Bill = mongoose.model("Bill", billSchema);

export default Bill;
