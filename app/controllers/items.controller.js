import express from "express";
import mongoose from "mongoose";
import Item from "../models/items.model.js";
import csv from "csvtojson";

const router = express.Router();

export const getItems = async (req, res) => {
  try {
    const allItems = await Item.find({
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
    });

    res.status(200).json(allItems);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const searchItem = async (req, res) => {
  try {
    const searchedItems = await Item.find({
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
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
    //Parse CSV data into JSON
    const csvData = await csv({
      colParser: {
        id: { cellParser: "number" },
        age: { cellParser: "number" },
      },
    }).fromFile(process.cwd() + `/${req.file?.path}`);

    // Fetch the existing data from the 'Item' collection
    const existingItemData = await Item.find(
      {},
      // { COMP_CD: csvData[0].COMP_CD },           //IMPORTANT for retrieving items with company code to update/add only specific company data
      { _id: 0, LORY_CD: 1 }
    );

    // Determine which documents need to be updated and which ones need to be inserted
    const documentsToUpdate = [];
    const documentsToInsert = [];
    for (const csvDocument of csvData) {
      const existingDocument = existingItemData.find(
        (existingDoc) => existingDoc.LORY_CD === csvDocument.LORY_CD
      );

      if (existingDocument) {
        // Document with the same LORY_CD already exists, so it needs an update
        documentsToUpdate.push(csvDocument);
      } else {
        // Document with the given LORY_CD doesn't exist, so it needs to be inserted
        documentsToInsert.push(csvDocument);
      }
    }

    // Perform bulk update and insert operations
    const bulkOps = [];

    // Push update operations to bulkOps
    documentsToUpdate.forEach((doc) => {
      bulkOps.push({
        updateOne: {
          filter: { LORY_CD: doc.LORY_CD },
          update: doc,
        },
      });
    });

    // Push insert operations to bulkOps
    bulkOps.push(
      ...documentsToInsert.map((doc) => ({
        insertOne: {
          document: doc,
        },
      }))
    );

    // Execute the bulkWrite operation
    const result = await Item.bulkWrite(bulkOps);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const checkItemQuantity = async (req, res) => {
  try {
    const item = await Item.findOne({ LORY_CD: req.params.itemId });
    if (item.BALQTY || item.BALQTY == 0) {
      res.json({
        balanceQuantity: item.BALQTY,
      });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
