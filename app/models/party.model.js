import { Decimal128 } from "bson";
import mongoose from "mongoose";

const partySchema = mongoose.Schema(
  {
    PARTY_CD: String,
    PARTY_NM: String,
    ADD1: String,
    ADD2: String,
    ADD3: String,
    PLACE: String,
    PIN: String,
    AREA: String,
    STATE: String,
    PHONE: String,
    FOOD_LIC: String,
    FOOD_DT: String,
    MST_NO: String,
    PAN_NO: String,
    CST_NO: String,
    BANK_NM: String,
    CLOSEDAY: Number,
    AGENT_CD: String,
    YOB: Decimal128,
    YOB1: Decimal128,
    Y_CL: Decimal128,
    DUE_DAY: Number,
    KM: Number,
    CR_LIMIT: Number,
    COMP_CD: { type: String },
    CLIENT_CD: { type: String },
  },
  {
    timestamps: true,
  }
);

// partySchema.index({ PARTY_NM: "text", PLACE: "text" });
partySchema.index({ PARTY_NM: "text" });
partySchema.index({ PLACE: "text" });
partySchema.index({ CLIENT_CD: 1, COMP_CD: 1 });

var Party = mongoose.model("Party", partySchema);

export default Party;
