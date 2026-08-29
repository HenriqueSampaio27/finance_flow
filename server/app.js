const express = require("express");
const cors = require("./config/cors");
const app = express();

const clientRoutes = require("./routes/clientRoutes");
const userRoutes = require("./routes/userRoute")

app.use(cors);
app.use(express.json());

app.use("/clients", clientRoutes);
app.use("/user", userRoutes);



app.get("/", (req, res) => {
  res.json({
    message: "API Raynex Solutions funcionando!"
  });
});


module.exports = app;