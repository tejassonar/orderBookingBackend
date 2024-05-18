import express from "express";
import mongoose from "mongoose";
import Item from "../models/items.model.js";
import csv from "csvtojson";

const router = express.Router();

export const getItems = async (req, res) => {
  try {
    let filterByQTY = {};
    if (!req.user.AGENCY) {
      filterByQTY = {
        BALQTY: { $ne: 0 },
      };
    }
    const allItems = await Item.find({
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
      ...filterByQTY,
    });
    res.status(200).json(allItems);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const searchItem = async (req, res) => {
  try {
    let filterByQTY = {};
    if (!req.user.AGENCY) {
      filterByQTY = {
        BALQTY: { $ne: 0 },
      };
    }
    const searchedItems = await Item.find({
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
      $or: [
        {
          ITEM_NM: {
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
      ...filterByQTY,
      // BALQTY: { $ne: 0 },
    });
    if (searchedItems.length > 0) {
      res.status(200).json(searchedItems);
    } else {
      res.status(400).json({ message: "No items found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
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

    // // Fetch the existing data from the 'Item' collection
    // const existingItemData = await Item.find(
    //   { COMP_CD: csvData[0].COMP_CD }, //IMPORTANT for retrieving items with company code to update/add only specific company data
    //   { _id: 0, LORY_CD: 1 }
    // );

    // // Determine which documents need to be updated and which ones need to be inserted
    // const documentsToUpdate = [];
    // const documentsToInsert = [];
    // for (const csvDocument of csvData) {
    //   const existingDocument = existingItemData.find(
    //     (existingDoc) => existingDoc.LORY_CD === csvDocument.LORY_CD
    //   );

    //   if (existingDocument) {
    //     // Document with the same LORY_CD already exists, so it needs an update
    //     documentsToUpdate.push(csvDocument);
    //   } else {
    //     // Document with the given LORY_CD doesn't exist, so it needs to be inserted
    //     documentsToInsert.push(csvDocument);
    //   }
    // }

    // // Perform bulk update and insert operations
    // const bulkOps = [];

    // // Push update operations to bulkOps
    // documentsToUpdate.forEach((doc) => {
    //   bulkOps.push({
    //     updateOne: {
    //       filter: { LORY_CD: doc.LORY_CD },
    //       update: doc,
    //     },
    //   });
    // });

    // // Push insert operations to bulkOps
    // bulkOps.push(
    //   ...documentsToInsert.map((doc) => ({
    //     insertOne: {
    //       document: doc,
    //     },
    //   }))
    // );

    // // Execute the bulkWrite operation
    // const result = await Item.bulkWrite(bulkOps);

    const deletedItems = await Item.deleteMany(
      { COMP_CD: csvData[0].COMP_CD, CLIENT_CD: csvData[0].CLIENT_CD } //IMPORTANT for retrieving items with company code to update/add only specific company data
    );
    const result = await Item.insertMany(csvData);
    res.status(200).json({
      insertedItems: result.length,
      deleteItems: deletedItems.length,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: err.message });
  }
};

export const deleteItems = async (req, res) => {
  try {
    // console.log(req.user.COMP_CD, req.user.CLIENT_CD, "===");
    console.log(req.body.COM_CD, req.body.CLIENT_CD);
    const deletedItems = await Item.deleteMany({
      COMP_CD: req.body.COM_CD,
      CLIENT_CD: req.body.CLIENT_CD,
    });
    res.status(200).json(deletedItems);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    req.body.forEach(async (item) => {
      const inventoryItem = await Item.findOne({ LORY_CD: item.LORY_CD });
      if (inventoryItem) {
        inventoryItem.BALQTY = inventoryItem.BALQTY + item.PUQTY;
        await inventoryItem.save();
      } else {
        const newInventoryItem = await Item.create(item);
      }
    });
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
export const updateItemQuantityAndRate = async (req, res) => {
  try {
    const item = req.body;
    // req.body.forEach(
    // const updatedItem = async () => {
    const inventoryItem = await Item.findOne({ LORY_CD: item.LORY_CD });
    if (inventoryItem) {
      inventoryItem.BALQTY = inventoryItem.BALQTY + (item?.PUQTY || 0);
      inventoryItem.RATE = item?.RATE;
      await inventoryItem.save();
    }
    // else {
    //   const newInventoryItem = await Item.create(item);
    // }
    // };

    // );
    res.status(200).json({ inventoryItem });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
