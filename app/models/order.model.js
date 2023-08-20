import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    USER_ID: String,
    ORD_DT: Date,
    ORD_NO: String,
    PARTY_CD: String,
    PARTY_NM: String,
    LORY_CD: String,
    LORY_NO: String,
    ITEM_NM: String,
    QTY: Number,
    RATE: Number,
    BRAND_CD: String,
    REMARK: String,
    ADD1: String,
    PLACE: String,
    AGENT_CD: { type: String, index: true },
    COMP_CD: { type: String, index: true },
    CLIENT_CD: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

var Order = mongoose.model("Order", orderSchema);

export default Order;
