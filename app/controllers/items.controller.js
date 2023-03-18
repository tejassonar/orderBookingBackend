import express from "express";
import mongoose from "mongoose";
import Item from "../models/items.model.js";
import csv from "csvtojson";

const router = express.Router();

export const getItems = async (req, res) => {
  try {
    const allItems = await Item.find();

    res.status(200).json(allItems);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const searchItem = async (req, res) => {
  try {
    const searchedItems = await Item.find({
      $or: [
        {
          LORY_CD: {
            $regex: new RegExp(req.query.name),
            $options: "i",
          },
        },
        {
          LORY_NO: {
            $regex: new RegExp(req.query.name),
            $options: "i",
          },
        },
      ],
    });
    if (searchedItems.length > 0) {
      res.status(200).json(searchedItems);
    } else {
      res.status(400).json({ message: "No items found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const addAllItems = async (req, res) => {
  try {
    const allItems = await Item.deleteMany({});

    const jsonArray = await csv({
      colParser: {
        id: { cellParser: "number" },
        age: { cellParser: "number" },
      },
    }).fromFile(process.cwd() + `/${req.file?.path}`);

    // console.log(jsonArray, "jsonArray");

    const items = await Item.insertMany(
      jsonArray
      //     , (err, docs) => {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log(docs, "==Docs==");
      //     res.status(200).json(jsonArray);
      //   }
      // }
    );
    res.status(200).json(jsonArray);

    console.log(items, "Items");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
