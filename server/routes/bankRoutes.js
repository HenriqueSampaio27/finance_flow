const express = require("express");
const router = express.Router();

const bankController = require("../controllers/bankController");

router.get("/", bankController.get);
router.get("/:id", bankController.getById);
router.post("/", bankController.create);
router.put("/:id", bankController.update);
router.delete("/:id", bankController.remove);

module.exports = router;