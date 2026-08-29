const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.get);

router.put("/:id", userController.update);

module.exports = router;