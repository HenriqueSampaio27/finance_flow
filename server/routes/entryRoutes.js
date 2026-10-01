const express = require("express");
const entryController = require("../controllers/entryController");

const router = express.Router();

router.post("/", entryController.create);

router.get("/", entryController.getAll);

router.get("/:id", entryController.getById);

router.delete("/:id", entryController.remove);

module.exports = router;