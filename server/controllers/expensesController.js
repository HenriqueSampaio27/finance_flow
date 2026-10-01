const expenseService = require("../services/expenseService");

async function create(req, res) {
  try {
    const expense = expenseService.create(req.body);

    res.status(201).json({
      message: "Saída criada com sucesso",
      expense
    });

  } catch (error) {
    console.error("Erro ao criar saída:", error);

    res.status(500).json({
      message: "Erro ao criar saída"
    });
  }
}

async function getAll(req, res) {
  try {
    const expense = expenseService.getAll();

    res.json(expense);

  } catch (error) {
    console.error("Erro ao buscar saídas:", error);

    res.status(500).json({
      message: "Erro ao buscar saídas"
    });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const expense = expenseService.getById(id);

    if (!expense) {
      return res.status(404).json({
        message: "Saída não encontrada"
      });
    }

    res.json(expense);

  } catch (error) {
    console.error("Erro ao buscar saída:", error);

    res.status(500).json({
      message: "Erro ao buscar saída"
    });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const deleted = expenseService.remove(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Saída não encontrada"
      });
    }

    res.json({
      message: "Saída excluída com sucesso"
    });

  } catch (error) {
    console.error("Erro ao excluir saída:", error);

    res.status(500).json({
      message: "Erro ao excluir saída"
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  remove
};