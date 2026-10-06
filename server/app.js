const express = require("express");
const cors = require("./config/cors");
const app = express();

const clientRoutes = require("./routes/clientRoutes");
const userRoutes = require("./routes/userRoute")
const entryRoutes  =require("./routes/entryRoutes")
const expenseRoutes = require("./routes/expenseRoutes")
const payableRoutes = require("./routes/payableRoutes")
const projectRoutes = require("./routes/projectRoutes")
const receivableRoutes = require("./routes/receivableRoutes")

app.use(cors);
app.use(express.json());

app.use("/clients", clientRoutes);
app.use("/user", userRoutes);
app.use("/entry", entryRoutes)
app.use("/expense", expenseRoutes)
app.use("/payable", payableRoutes)
app.use("/project", projectRoutes)
app.use("/accounts_receivable", receivableRoutes)


app.get("/", (req, res) => {
  res.json({
    message: "API Raynex Solutions funcionando!"
  });
});


module.exports = app;