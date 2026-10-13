const bankService = require("../services/bankService");

function validId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

function validateBank(data) {
  if (!data.name || !data.name.trim()) {
    return "O nome da conta é obrigatório.";
  }

  if (!data.bank || !data.bank.trim()) {
    return "O nome do banco é obrigatório.";
  }

  if (!data.tipo || !data.tipo.trim()) {
    return "O tipo da conta é obrigatório.";
  }

  const saldo = Number(data.saldo ?? 0);

  if (!Number.isFinite(saldo) || saldo < 0) {
    return "O saldo deve ser um número válido e não negativo.";
  }

  if (
    data.isPositive !== undefined &&
    typeof data.isPositive !== "boolean"
  ) {
    return "O campo isPositive deve ser booleano.";
  }

  return null;
}

// GET /bank
function get(req, res) {
  try {
    const banks = bankService.getAll();

    res.status(200).json(banks);
  } catch (error) {
    console.error("Erro ao buscar contas bancárias:", error);

    res.status(500).json({
      message: "Erro ao buscar contas bancárias."
    });
  }
}

// GET /bank/:id
function getById(req, res) {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        message: "ID inválido."
      });
    }

    const bank = bankService.getById(Number(id));

    if (!bank) {
      return res.status(404).json({
        message: "Conta bancária não encontrada."
      });
    }

    res.status(200).json(bank);
  } catch (error) {
    console.error("Erro ao buscar conta bancária:", error);

    res.status(500).json({
      message: "Erro ao buscar conta bancária."
    });
  }
}

// POST /bank
function create(req, res) {
  try {
    const validationError = validateBank(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const bank = bankService.create(req.body);

    res.status(201).json({
      message: "Conta bancária cadastrada com sucesso.",
      bank
    });
  } catch (error) {
    console.error("Erro ao cadastrar conta bancária:", error);

    res.status(500).json({
      message: "Erro ao cadastrar conta bancária."
    });
  }
}

// PUT /bank/:id
function update(req, res) {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        message: "ID inválido."
      });
    }

    const validationError = validateBank(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError
      });
    }

    const bank = bankService.update(Number(id), req.body);

    if (!bank) {
      return res.status(404).json({
        message: "Conta bancária não encontrada."
      });
    }

    res.status(200).json({
      message: "Conta bancária atualizada com sucesso.",
      bank
    });
  } catch (error) {
    console.error("Erro ao atualizar conta bancária:", error);

    res.status(500).json({
      message: "Erro ao atualizar conta bancária."
    });
  }
}

// DELETE /bank/:id
function remove(req, res) {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        message: "ID inválido."
      });
    }

    const deleted = bankService.remove(Number(id));

    if (!deleted) {
      return res.status(404).json({
        message: "Conta bancária não encontrada."
      });
    }

    res.status(200).json({
      message: "Conta bancária excluída com sucesso."
    });
  } catch (error) {
    console.error("Erro ao excluir conta bancária:", error);

    res.status(500).json({
      message: "Erro ao excluir conta bancária."
    });
  }
}

module.exports = {
  get,
  getById,
  create,
  update,
  remove
};