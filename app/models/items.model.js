import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
  {
    LORY_CD: String,
    LORY_NO: String,
    WEIGHT: Number,
    QTY: Number,
    ORD_DT: { type: mongoose.SchemaTypes.Mixed, required: false },
    P_LORY: String,
    SLQTY: Number,
    YOP_WAT: Number,
    YOP_QTY: Number,
    GCD: {
      type: Number,
      required: false,
    },
    BALQTY: Number,
    PKG: Number,
    COMPANY_CODE: String,
    CLIENT_CODE: String,
  },
  {
    timestamps: true,
  }
);

// itemSchema.index({ LORY_CD: "text", LORY_NO: "text" });
itemSchema.index({ LORY_CD: "text" });
itemSchema.index({ LORY_NO: "text" });
itemSchema.index({ CLIENT_CODE: 1, COMPANY_CODE: 1 });

var Item = mongoose.model("Item", itemSchema);

export default Item;
