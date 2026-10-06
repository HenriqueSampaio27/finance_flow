
const receivableService = require("../services/receivableService");

async function create(req, res) {
  try {
    const receivable = receivableService.create(req.body);

    res.status(201).json({
      message: "Conta a receber criada com sucesso",
      receivable
    });

  } catch (error) {
    console.error("Erro ao criar conta a receber:", error);

    res.status(500).json({
      message: error.message || "Erro ao criar conta a receber"
    });
  }
}

async function getAllReceivable(req, res) {
  try {
    const receivables = receivableService.getAll();

    res.json(receivables);

  } catch (error) {
    console.error("Erro ao buscar contas a receber:", error);

    res.status(500).json({
      message: "Erro ao buscar contas a receber"
    });
  }
}

async function registerPaymentStatus(req, res) {
  try {
    const { id } = req.params;

    const {
      paymentAmount,
      receipt,
      destination_account,
      fee,
    } = req.body;


    // ==============================
    // VALIDAÇÕES
    // ==============================

    if (
      paymentAmount === undefined ||
      paymentAmount === null ||
      paymentAmount === ""
    ) {
      return res.status(400).json({
        message: "O valor pago é obrigatório",
      });
    }

    if (!receipt) {
      return res.status(400).json({
        message: "A forma de recebimento é obrigatória",
      });
    }

    if (!destination_account) {
      return res.status(400).json({
        message: "A conta de destino é obrigatória",
      });
    }


    // ==============================
    // REGISTRA PAGAMENTO
    // ==============================

    const receivable =
      receivableService.registerPayment(
        id,
        paymentAmount,
        receipt,
        destination_account,
        fee
      );


    if (!receivable) {
      return res.status(404).json({
        message: "Conta a receber não encontrada",
      });
    }


    res.json({
      message: "Pagamento registrado com sucesso",
      receivable,
    });

  } catch (error) {

    console.error(
      "Erro ao registrar pagamento:",
      error
    );

    res.status(400).json({
      message:
        error.message ||
        "Erro ao registrar pagamento",
    });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const receivable = receivableService.getById(id);

    if (!receivable) {
      return res.status(404).json({
        message: "Conta a receber não encontrada"
      });
    }

    res.json(receivable);

  } catch (error) {
    console.error("Erro ao buscar conta a receber:", error);

    res.status(500).json({
      message: "Erro ao buscar conta a receber"
    });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;

    const receivable = receivableService.update(id, req.body);

    if (!receivable) {
      return res.status(404).json({
        message: "Conta a receber não encontrada"
      });
    }

    res.json({
      message: "Conta a receber atualizada com sucesso",
      receivable
    });

  } catch (error) {
    console.error("Erro ao atualizar conta a receber:", error);

    res.status(500).json({
      message: error.message || "Erro ao atualizar conta a receber"
    });
  }
}

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "O status é obrigatório"
      });
    }

    const receivable = receivableService.updateStatus(id, status);

    if (!receivable) {
      return res.status(404).json({
        message: "Conta a receber não encontrada"
      });
    }

    res.json({
      message: "Status atualizado com sucesso",
      status: receivable.status
    });

  } catch (error) {
    console.error("Erro ao atualizar status:", error);

    res.status(500).json({
      message: "Erro ao atualizar status"
    });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const deleted = receivableService.remove(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Conta a receber não encontrada"
      });
    }

    res.json({
      message: "Conta a receber excluída com sucesso"
    });

  } catch (error) {
    console.error("Erro ao excluir conta a receber:", error);

    res.status(500).json({
      message: "Erro ao excluir conta a receber"
    });
  }
}

module.exports = {
  create,
  getAllReceivable,
  getById,
  update,
  updateStatus,
  remove,
  registerPaymentStatus
};