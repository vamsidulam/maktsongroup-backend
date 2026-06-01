const express = require("express");
const { seedAdmin } = require("../services/seed");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await seedAdmin();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
