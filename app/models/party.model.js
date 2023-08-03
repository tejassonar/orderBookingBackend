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
    // FOOD_LIC: String,
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
    COMPANY_CODE: { type: String },
    CLIENT_CODE: { type: String },
  },
  {
    timestamps: true,
  }
);

// partySchema.index({ PARTY_NM: "text", PLACE: "text" });
partySchema.index({ PARTY_NM: "text" });
partySchema.index({ PLACE: "text" });
partySchema.index({ CLIENT_CODE: 1, COMPANY_CODE: 1 });

var Party = mongoose.model("Party", partySchema);

export default Party;
