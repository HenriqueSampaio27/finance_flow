const express = require("express");
const project = require("../controllers/projectController");

const router = express.Router();

router.post("/", project.create);

router.get("/", project.getAll);

router.get("/:id", project.getById);

router.put("/:id", project.updateProject);

router.delete("/:id", project.remove);

module.exports = router;