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
    MST_NO: String,
    APN_NO: String,
    CST_NO: String,
    BANK_NM: String,
    CLOSEDAY: Number,
    AGENT_CD: String,
    YOB: Decimal128,
    YOB1: Decimal128,
    Y_CL: Decimal128,
    DUEDAY: Number,
    KM: Number,
    CR_LIMIT: Number,
    COMPANY_CODE: { type: String, index: true },
    CLIENT_CODE: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

partySchema.index({ LORY_CD: "text", LORY_NO: "text" });

var Party = mongoose.model("Party", partySchema);

export default Party;
