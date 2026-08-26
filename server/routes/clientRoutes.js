const express = require("express");
const clientController = require("../controllers/clientController");

const router = express.Router();

router.post("/", clientController.create);

router.get("/", clientController.getAll);

router.get("/:id", clientController.getById);

router.put("/:id", clientController.update);

router.delete("/:id", clientController.remove);

module.exports = router;