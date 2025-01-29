import express from "express";
import Item from "../models/Item.js";
const router = express.Router();

// Get all items for a specific seller
router.get("/items", async (req, res) => {
  try {
    const { sellerId } = req.query;
    const items = await Item.find({ sellerId });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

// Add a new item
router.post("/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Error adding item", error });
  }
});

module.exports = router;
