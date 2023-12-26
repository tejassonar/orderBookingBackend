import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
  {
    ITEM_NM: String,
    ITEM_CD: String,
    LORY_CD: { type: String, index: true, unique: false, required: true },
    LORY_NO: String,
    WEIGHT: Number,
    QTY: Number,
    RATE: Number,
    ORD_DT: { type: mongoose.SchemaTypes.Mixed, required: false },
    P_LORY: String,
    SLQTY: Number,
    YOP_WAT: Number,
    YOP_QTY: Number,
    GCD: {
      type: Number,
      required: false,
    },
    PUQTY: Number,
    SLWAT: Number,
    // PUWAT: Number,
    BALQTY: Number,
    PKG: Number,
    COMP_CD: String,
    CLIENT_CD: String,
  },
  {
    timestamps: true,
  }
);

// itemSchema.index({ LORY_CD: "text", LORY_NO: "text" });
itemSchema.index({ ITEM_NM: "text" });
itemSchema.index({ LORY_NO: "text" });
itemSchema.index({ CLIENT_CD: 1, COMP_CD: 1 });

var Item = mongoose.model("Item", itemSchema);

export default Item;
