import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    USER_ID: String,
    ORD_DT: Date,
    ORD_NO: Number,
    PARTY_CD: String,
    ITEM_CD: String,
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
