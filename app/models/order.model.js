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
    QTY: Number,
    RATE: Number,
    BRAND_CD: String,
    REMARK: String,
  },
  {
    timestamps: true,
  }
);

var Order = mongoose.model("Order", orderSchema);

export default Order;
