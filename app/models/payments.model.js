import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    BILL_DT: Date,
    BILL_NO: {
      type: String,
      // unique: true,
      // required: [true, "Please add a DOC_NO"],
    },
    PARTY_CD: String,
    PARTY_NM: String,
    REMARK: String,
    DOC_NO: {
      type: String,
    },
    DOC_DT: Date,
    BIL_AMT: Number,
    PND_AMT: Number,
    RCV_AMT: Number,
    TRANSACTION_NO: String,
    CHQ_DT: Date,
    PAYMENT_TYPE: String,
    AGENT_CD: { type: String, index: true },
    COMP_CD: { type: String, index: true, required: true },
    CLIENT_CD: { type: String, index: true, required: true },
  },
  {
    timestamps: true,
  }
);

// userSchema.index({ LORY_CD: "text", LORY_NO: "text" });

var Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
