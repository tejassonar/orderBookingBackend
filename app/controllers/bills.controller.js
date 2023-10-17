import Bill from "../models/bills.model.js";
import csv from "csvtojson";

export const addAllBills = async (req, res) => {
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

    const deletedItems = await Bill.deleteMany(
      { COMP_CD: csvData[0].COMP_CD } //IMPORTANT for retrieving items with company code to update/add only specific company data
    );
    const result = await Bill.insertMany(csvData);
    res.status(200).json({
      insertedItems: result.length,
      deleteItems: deletedItems.length,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPartyBills = async (req, res) => {
  try {
    const bills = await Bill.aggregate([
      {
        $match: {
          COMP_CD: req.user.COMP_CD,
          CLIENT_CD: req.user.CLIENT_CD,
          PARTY_CD: req.params.partyCode,
        },
      },
      {
        $sort: {
          DOC_DT: 1,
        },
      },
      {
        $project: {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      {
        $group: {
          _id: null,
          totalPendingAmount: { $sum: "$PND_AMT" },
          bills: { $push: "$$ROOT" },
        },
      },
    ]);

    res.status(200).json(bills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
