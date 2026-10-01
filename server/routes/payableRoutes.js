const express = require("express");
const payableController = require("../controllers/payableController");

const router = express.Router();

router.post("/", payableController.create);

router.get("/", payableController.getAll);

router.get("/:id", payableController.getById);

router.put("/:id", payableController.updateStatus);

router.delete("/:id", payableController.remove);

module.exports = router;