import express from "express";
import mongoose from "mongoose";
import Party from "../models/party.model.js";
import csv from "csvtojson";

const router = express.Router();

export const getParties = async (req, res) => {
  try {
    const allParties = await Party.find().limit(100);
    res.status(200).json(allParties);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const searchParty = async (req, res) => {
  try {
    const searchedParties = await Party.find({
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
    });
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
    const allParties = await Party.deleteMany({});

    const jsonArray = await csv({
      colParser: {
        id: { cellParser: "number" },
        age: { cellParser: "number" },
      },
    }).fromFile(process.cwd() + `/${req.file?.path}`);

    // console.log(jsonArray, "jsonArray");

    const parties = await Party.insertMany(
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

    console.log(parties, "Parties");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
