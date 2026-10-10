const payableService = require("../services/payableService");

async function create(req, res) {
  try {
    const {
      date,
      amount,
      installment_total
    } = req.body;

    if (!date) {
      return res.status(400).json({
        message: "A data é obrigatória"
      });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        message: "O valor é obrigatório"
      });
    }

    const totalInstallments = Number(installment_total) || 1;

    if (totalInstallments < 1) {
      return res.status(400).json({
        message: "O número de parcelas deve ser maior que zero"
      });
    }

    const payable = payableService.create(req.body);

    res.status(201).json({
      message: "Conta a pagar criada com sucesso",
      payable
    });

  } catch (error) {
    console.error("Erro ao criar conta a pagar:", error);

    res.status(500).json({
      message: "Erro ao criar conta a pagar"
    });
  }
}

async function getAll(req, res) {
  try {
    const payable = payableService.getAll();

    res.json(payable);

  } catch (error) {
    console.error("Erro ao buscar contas a pagar:", error);

    res.status(500).json({
      message: "Erro ao buscar contas a pagar"
    });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const payable = payableService.getById(id);

    if (!payable) {
      return res.status(404).json({
        message: "Conta a pagar não encontrada"
      });
    }

    res.json(payable);

  } catch (error) {
    console.error("Erro ao buscar conta a pagar:", error);

    res.status(500).json({
      message: "Erro ao buscar conta a pagar"
    });
  }
}

// ALTERAR STATUS
async function registerPaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const {
      receipt,
      account
    } = req.body;

    const payable = payableService.registerPayment(id, receipt, account);

    if (!payable) {
      return res.status(404).json({
        message: "Conta a pagar não encontrada"
      });
    }

    return res.json({
      message: "Conta paga com sucesso e saída registrada",
      payable
    });

  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);

    if (
      error.message === "Conta a pagar não encontrada."
    ) {
      return res.status(404).json({
        message: error.message
      });
    }

    if (
      error.message === "Esta conta já foi paga." ||
      error.message === "O valor da conta deve ser maior que zero."
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Erro ao registrar pagamento"
    });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const removed = payableService.remove(id);

    if (!removed) {
      return res.status(404).json({
        message: "Conta a pagar não encontrada"
      });
    }

    res.json({
      message: "Conta a pagar excluída com sucesso"
    });

  } catch (error) {
    console.error("Erro ao excluir conta a pagar:", error);

    res.status(500).json({
      message: "Erro ao excluir conta a pagar"
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  registerPaymentStatus,
  remove
};