import express from "express";
import mongoose from "mongoose";
import Party from "../models/party.model.js";
import csv from "csvtojson";
import fs from "fs";
import { parse } from "csv-parse";
const router = express.Router();

export const getParties = async (req, res) => {
  try {
    let findQuery = {
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
    };
    if (req?.user?.AGENT_CD) {
      findQuery = {
        ...findQuery,
        $or: [{ AGENT_CD: req.user.AGENT_CD }, { AGENT_CD: "" }],
      };
    }
    console.log(findQuery, "findQuery");
    const allParties = await Party.find(findQuery).limit(20);

    res.status(200).json(allParties);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const searchParty = async (req, res) => {
  try {
    let findQuery = {
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
    };
    let filters = [];
    if (req?.user?.AGENT_CD) {
      findQuery = {
        ...findQuery,
        $or: [{ AGENT_CD: req.user.AGENT_CD }, { AGENT_CD: "" }],
      };
    }
    if (req.query?.limit) {
      filters = [...filters, { $limit: Number(req.query.limit) }];
    }
    // console.log(findQuery, "findQuery", ...filters);
    const searchedParties = await Party.aggregate([
      {
        $match: {
          ...findQuery,
          $and: [
            {
              $or: [
                {
                  PARTY_NM: {
                    $regex: new RegExp(req.query.name),
                    $options: "i",
                  },
                },
                {
                  PLACE: {
                    $regex: new RegExp(req.query.name),
                    $options: "i",
                  },
                },
              ],
            },
          ],
        },
      },
      ...filters,
    ]);

    // const searchedParties = await Party.find({
    //   ...findQuery,
    //   $and: [
    //     {
    //       $or: [
    //         {
    //           PARTY_NM: {
    //             $regex: new RegExp(req.query.name),
    //             $options: "i",
    //           },
    //         },
    //         {
    //           PLACE: {
    //             $regex: new RegExp(req.query.name),
    //             $options: "i",
    //           },
    //         },
    //       ],
    //     },
    //   ],
    //   ...filters,
    // });
    if (searchedParties.length > 0) {
      res.status(200).json(searchedParties);
    } else {
      res.status(400).json({ message: "No parties found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const addAllParties = async (req, res) => {
  try {
    // Read the data from the CSV file and store it in an array of objects
    // const csvFilePath = process.cwd() + `/${req.file?.path}`;
    // const csvData = [];
    // fs.createReadStream(csvFilePath)
    //   .pipe(parse({ delimiter: "," }))
    //   .on("data", (csvRow) => {
    //     // Assuming the CSV has columns corresponding to the Party fields
    //     const [PARTY_CD, PARTY_NM, ADD1, ADD2 /* and so on */] = csvRow;
    //     csvData.push({
    //       PARTY_CD,
    //       PARTY_NM,
    //       ADD1,
    //       ADD2,
    //       /* and so on */
    //     });
    //   })
    //   .on("end", async () => {
    const csvData = await csv({
      colParser: {
        id: { cellParser: "number" },
        age: { cellParser: "number" },
      },
    }).fromFile(process.cwd() + `/${req.file?.path}`);

    // Fetch the existing data from the 'Party' collection
    const existingPartyData = await Party.find(
      { COMP_CD: csvData[0].COMP_CD, CLIENT_CD: csvData[0].CLIENT_CD }, //IMPORTANT for retrieving parties with company code to update/add only specific company data
      { _id: 0, PARTY_CD: 1 }
    );

    // Determine which documents need to be updated and which ones need to be inserted
    const documentsToUpdate = [];
    const documentsToInsert = [];
    for (const csvDocument of csvData) {
      const existingDocument = existingPartyData.find(
        (existingDoc) => existingDoc.PARTY_CD === csvDocument.PARTY_CD
      );

      if (existingDocument) {
        // Document with the same PARTY_CD already exists, so it needs an update
        documentsToUpdate.push(csvDocument);
      } else {
        // Document with the given PARTY_CD doesn't exist, so it needs to be inserted
        documentsToInsert.push(csvDocument);
      }
    }

    // Perform bulk update and insert operations
    const bulkOps = [];

    // Push update operations to bulkOps
    documentsToUpdate.forEach((doc) => {
      bulkOps.push({
        updateOne: {
          filter: { PARTY_CD: doc.PARTY_CD },
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
    const result = await Party.bulkWrite(bulkOps);
    res.status(200).json(result);

    // });

    // const allParties = await Party.deleteMany({});

    // const jsonArray = await csv({
    //   colParser: {
    //     id: { cellParser: "number" },
    //     age: { cellParser: "number" },
    //   },
    // }).fromFile(process.cwd() + `/${req.file?.path}`);

    // // console.log(jsonArray, "jsonArray");

    // const parties = await Party.insertMany(
    //   jsonArray
    //   //     , (err, docs) => {
    //   //   if (err) {
    //   //     console.log(err);
    //   //   } else {
    //   //     console.log(docs, "==Docs==");
    //   //     res.status(200).json(jsonArray);
    //   //   }
    //   // }
    // );
    // res.status(200).json(jsonArray);

    // console.log(parties, "Parties");
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteParties = async (req, res) => {
  try {
    console.log(req.user.COMP_CD, req.user.CLIENT_CD, "===");
    const deletedParties = await Party.deleteMany({
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
    });
    res.status(200).json(deletedParties);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
