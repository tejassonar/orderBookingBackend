import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import csv from "csvtojson";
import { log } from "console";
import Item from "../models/items.model.js";

const router = express.Router();

export const getOrders = async (req, res) => {
  try {
    const dateObj = req.query.date ? new Date(req.query.date) : new Date();
    const orderDate = new Date(
      Date.UTC(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        0,
        0,
        0
      )
    );

    let findQuery = {
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
    };
    if (req?.user?.AGENT_CD) {
      findQuery = { ...findQuery, AGENT_CD: req.user.AGENT_CD };
    }
    const allOrders = await Order.aggregate([
      {
        $match: {
          ...findQuery,
          ORD_DT: {
            $eq: orderDate,
            // $lt: new Date(orderDate.setDate(orderDate.getDate() + 1)),
          },
        },
      },

      {
        $group: {
          _id: "$ORD_NO",
          USER_ID: { $first: "$USER_ID" },
          ORD_DT: { $first: "$ORD_DT" },
          ORD_NO: { $first: "$ORD_NO" },
          PARTY_CD: { $first: "$PARTY_CD" },
          PARTY_NM: { $first: "$PARTY_NM" },
          PLACE: { $first: "$PLACE" },
          ADD1: { $first: "$ADD1" },
          createdAt: { $first: "$createdAt" },
          ITEMS: {
            $push: {
              LORY_CD: "$LORY_CD",
              LORY_NO: "$LORY_NO",
              ITEM_NM: "$ITEM_NM",
              QTY: "$QTY",
              RATE: "$RATE",
              BRAND_CD: "$BRAND_CD",
              REMARK: "$REMARK",
            },
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
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
          PLACE: 1,
          ADD1: 1,
          ITEMS: 1,
        },
      },
    ]);
    res.status(200).json(allOrders);
  } catch (error) {
    console.log(error, "Errrror");
    res.status(400).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  // try {
  req.body.orders.forEach(async (order) => {
    const item = await Item.findOne({ LORY_CD: order.LORY_CD });
    if (item && item.BALQTY >= Number(order.QTY)) {
      item.BALQTY = item.BALQTY - Number(order.QTY);
      await item.save();
    } else {
      res.status(400);
      throw new Error("Something Went Wrong!!");
    }
  });
  const order = await Order.insertMany(req.body.orders);
  res.status(200).json(order);
  // res.status(200).json({ res: "success" });
  // } catch (err) {
  //   res.status(400).json({ message: err.message });
  // }
};

export const getOrdersCSV = async (req, res) => {
  try {
    const dateObj = req.query.date ? new Date(req.query.date) : new Date();
    const orderDate = new Date(
      Date.UTC(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        0,
        0,
        0
      )
    );
    let findQuery = {
      COMP_CD: req.query.COMP_CD,
      CLIENT_CD: req.query.CLIENT_CD,
    };
    if (req?.query?.AGENT_CD) {
      findQuery = { ...findQuery, AGENT_CD: req.query.AGENT_CD };
    }
    const allOrders = await Order.find({
      ...findQuery,
      ORD_DT: {
        $eq: orderDate,
        // $lt: new Date(orderDate.setDate(orderDate.getDate() + 1)),
      },
    });
    const items = JSON.parse(JSON.stringify(allOrders));
    if (items.length == 0) {
      res.status(200);
      res.json({ message: "No Orders Found" });
    }
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(items[0]);
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
    res.status();
  }
};
