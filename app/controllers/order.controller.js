import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import csv from "csvtojson";
import { log } from "console";
import Item from "../models/items.model.js";

const router = express.Router();

export const getOrders = async (req, res) => {
  try {
    const allOrders = await Order.aggregate([
      {
        $group: {
          _id: "$ORD_NO",
          USER_ID: { $first: "$USER_ID" },
          ORD_DT: { $first: "$ORD_DT" },
          ORD_NO: { $first: "$ORD_NO" },
          PARTY_CD: { $first: "$PARTY_CD" },
          PARTY_NM: { $first: "$PARTY_NM" },
          ITEMS: {
            $push: {
              LORY_CD: "$LORY_CD",
              LORY_NO: "$LORY_NO",
              QTY: "$QTY",
              RATE: "$RATE",
              BRAND_CD: "$BRAND_CD",
              REMARK: "$REMARK",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          USER_ID: 1,
          ORD_DT: 1,
          ORD_NO: 1,
          PARTY_CD: 1,
          PARTY_NM: 1,
          ITEMS: 1,
        },
      },
    ]);

    res.status(200).json(allOrders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    req.body.orders.forEach(async (order) => {
      const item = await Item.findOne({ LORY_CD: order.LORY_CD });
      if (item && item.BALQTY >= Number(order.QTY)) {
        item.BALQTY = item.BALQTY - Number(order.QTY);
        console.log(item, "Item");
        await item.save();
      } else {
        res.status(400);
        throw new Error("Something Went Wrong!!");
      }
    });
    console.log(req.body.orders, "req.body.orders");
    const order = await Order.insertMany(req.body.orders);
    res.status(200).json(order);
    // res.status(200).json({ res: "success" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getOrdersCSV = async (req, res) => {
  try {
    const allOrders = await Order.find();
    console.log(allOrders, "allOrders");
    const items = JSON.parse(JSON.stringify(allOrders));
    console.log(items, "items");
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    console.log(header, "Headerrr");
    const csv = [
      header.join(","), // header row first
      ...items.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      ),
    ].join("\r\n");

    res.header("Content-Type", "text/csv");
    res.attachment("order.csv");
    return res.send(csv);
  } catch (err) {
    console.log(err, "Error==");
  }
};
