import express from "express";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import csv from "csvtojson";
import { log } from "console";

const router = express.Router();

export const getOrders = async (req, res) => {
  try {
    const allOrders = await Order.find().limit(10);

    res.status(200).json(allOrders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const order = await Order.insertMany(req.body.orders);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getOrdersCSV = async (req, res) => {
  try {
    console.log("______");
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
