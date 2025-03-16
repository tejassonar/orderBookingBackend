import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import csv from "csvtojson";
import { log } from "console";
import Item from "../models/items.model.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

export const getOrders = async (req, res) => {
  try {
    let fromDate;
    let toDate;
    if (req.query?.from && req.query?.to) {
      const from = new Date(req.query.from);
      const to = new Date(req.query.to);
      if (from > to) {
        res
          .status(400)
          .json({ message: "To Date should be greater than From Date" });
      }
      fromDate = new Date(
        Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0)
      );
      toDate = new Date(
        Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), 0, 0, 0)
      );
    }
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
    if (req.query?.partyCode) {
      findQuery = { ...findQuery, PARTY_CD: req.query.partyCode };
    }
    // const startOfDay = new Date(orderDate);
    // startOfDay.setHours(0, 0, 0, 0);

    // const endOfDay = new Date(orderDate);
    // endOfDay.setHours(23, 59, 59, 999);

    const orderDateQuery = {
      ORD_DT:
        fromDate && toDate
          ? {
              $gte: fromDate,
              $lte: toDate,
            }
          : { $eq: orderDate },
      // {
      //     $gte: startOfDay,
      //     $lte: endOfDay,
      //   },
    };
    const allOrders = await Order.aggregate([
      {
        $match: {
          ...findQuery,
          ...orderDateQuery,
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
          REMARK: { $first: "$REMARK" },
          createdAt: { $first: "$createdAt" },
          AGENT_CD: { $first: "$AGENT_CD" },
          ITEMS: {
            $push: {
              orderItemId: "$_id",
              LORY_CD: "$LORY_CD",
              LORY_NO: "$LORY_NO",
              ITEM_NM: "$ITEM_NM",
              QTY: "$QTY",
              RATE: "$RATE",
              BRAND_CD: "$BRAND_CD",
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
          REMARK: 1,
          PARTY_NM: 1,
          PLACE: 1,
          ADD1: 1,
          AGENT_CD: 1,
          ITEMS: 1,
          createdAt: 1,
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
  try {
    const orders = [];
    console.log(req.user?.BROKER, "req.user.BROKER");
    console.log(req.body.orders, "req.body.orders");
    if (!req.user?.BROKER) {
      for (const order of req.body.orders) {
        const item = await Item.findOne({ LORY_CD: order.LORY_CD });
        if (item && item.BALQTY >= Number(order.QTY)) {
          item.BALQTY = item.BALQTY - Number(order.QTY);
          await item.save();
          orders.push(order);
        } else {
          res.status(400);
          throw new Error("Something Went Wrong!!");
        }
      }
    }
    console.log(orders, "ordersssss");

    if (orders.length > 0) {
      const order = await Order.insertMany(orders);
      res.status(200).json(order);
    } else if (req.user?.BROKER) {
      const order = await Order.insertMany(req.body.orders);
      res.status(200).json(order);
    } else {
      res.status(400).json({ message: "No orders were inserted" });
    }
  } catch (err) {
    console.error(err, "Error==");
    res.status(400);
  }
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
      return;
    }
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    // const header = Object.keys(items[0]);
    const header = [
      "_id",
      "USER_ID",
      "ORD_DT",
      "ORD_NO",
      "PARTY_CD",
      "PARTY_NM",
      "LORY_CD",
      "LORY_NO",
      "ITEM_NM",
      "QTY",
      "RATE",
      "REMARK",
      "ADD1",
      "PLACE",
      "AGENT_CD",
      "COMP_CD",
      "CLIENT_CD",
      "ITEM_CD",
      "__v",
      "createdAt",
      "updatedAt",
    ];
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
    // return;
  } catch (err) {
    console.log(err, "Error==");
    res.status(400);
  }
};

export const updateOrderItem = async (req, res) => {
  try {
    const orderItem = await Order.findById(req.params.orderItemId);

    if (!orderItem) {
      res.status(400).json({ message: "Order item not found!" });
      return;
    }

    //Quantity cases
    //1. Increased quantity should be less than Item's BALQTY
    //2. If QTY is increased reduce the Item's BALQTY by the difference
    //3. If QTY is decreased increase the Item's BALQTY by the difference

    const item = await Item.findOne({ LORY_CD: orderItem.LORY_CD });
    console.log(item, "Item");
    if (item) {
      const differenceInQTY = req.body.QTY - orderItem.QTY;
      if (req.body.QTY && differenceInQTY) {
        if (differenceInQTY > 0 && item.BALQTY < differenceInQTY) {
          res.status(400).json({
            message: "Can't update the item due to insufficient quantity",
          });
          return;
        } else {
          item.BALQTY = item.BALQTY - differenceInQTY;
        }
      }
    }
    await Object.assign(orderItem, req.body);

    const errors = await orderItem.validateSync();
    if (errors) {
      console.log(errors, "errors");
      res.status(400);
      res.json({ message: "Invalid data" });
      return;
    }
    if (item) await item.save();
    await orderItem.save();
    res.status(200).json({ message: "Items saved successfully" });
  } catch (err) {
    console.log(err, "Error");
    res.status(400);
  }
};

export const addOrderItems = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const items = req.body.orders;
    console.log(items, "items");

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid request: Expected an array of items!" });
    }
    console.log("1");

    const orderId = items[0].orderId; // Assuming all items belong to the same order.

    if (!orderId) {
      return res.status(400).json({ message: "Missing required orderId!" });
    }
    console.log("2");

    // Find the order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      return res.status(400).json({ message: "Order not found!" });
    }
    console.log("3");

    const orderItemsToSave = [];
    const itemUpdates = [];

    for (const { LORY_CD, QTY, ...rest } of items) {
      console.log("4");

      if (!LORY_CD || !QTY) {
        return res
          .status(400)
          .json({ message: "Missing required fields for an item!" });
      }

      // Check if the item exists
      const item = await Item.findOne({ LORY_CD });
      if (!item) {
        return res
          .status(400)
          .json({ message: `Item with LORY_CD ${LORY_CD} not found!` });
      }

      // Validate stock availability
      if (item.BALQTY < QTY) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for item ${LORY_CD}!` });
      }
      console.log("5");

      // Deduct quantity from available stock
      item.BALQTY -= QTY;
      await item.save({ session });
      itemUpdates.push(item);

      // Create new order item
      const newOrderItem = new Order({
        orderId,
        LORY_CD,
        QTY,
        ...rest,
      });
      console.log("6");

      // Validate the new order item
      const errors = newOrderItem.validateSync();
      if (errors) {
        return res
          .status(400)
          .json({ message: "Invalid data in one or more items", errors });
      }
      console.log(newOrderItem, "newOrderItem");

      await newOrderItem.save({ session });
      orderItemsToSave.push(newOrderItem);
    }
    console.log("7");

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    console.log("Transaction committed successfully.");

    res.status(201).json({ message: "Items added successfully" });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteOrderItem = async (req, res) => {
  try {
    const orderItem = await Order.findById(req.params.orderItemId);

    if (!orderItem) {
      res.status(400).json({ message: "Order item not found!" });
      return;
    }

    const item = await Item.findOne({ LORY_CD: orderItem.LORY_CD });

    if (item) {
      item.BALQTY = item.BALQTY + orderItem.QTY;

      const errors = await item.validateSync();
      if (errors) {
        res.status(400);
        res.json({ message: "Can't perform this action!" });
      }
      await item.save();
    }

    const deletedOrderItem = await Order.deleteOne({
      _id: req.params.orderItemId,
    });
    res.status(200).json(deletedOrderItem);
  } catch (err) {
    console.log(err, "Error");
    res.status(400);
  }
};
