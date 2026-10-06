const express = require("express");
const receivableController = require("../controllers/receivableController");

const router = express.Router();

router.post("/", receivableController.create);

router.put("/:id", receivableController.update);

router.patch("/:id/payment", receivableController.registerPaymentStatus);

//router.patch("/:id/status", receivableController.updateStatus);

router.get("/", receivableController.getAllReceivable);

router.get("/:id", receivableController.getById);

router.delete("/:id", receivableController.remove);

module.exports = router;