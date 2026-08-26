const clientService = require("../services/clientService");

async function create(req, res) {
  try {
    const client = clientService.create(req.body);

    res.status(201).json({
      message: "Cliente salvo com sucesso",
      client
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao salvar cliente"
    });
  }
}

async function getAll(req, res) {
  try {
    const clients = clientService.getAll();

    res.json(clients);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao buscar clientes"
    });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const client = clientService.getById(id);

    if (!client) {
      return res.status(404).json({
        message: "Cliente não encontrado"
      });
    }

    res.json(client);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao buscar cliente"
    });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;

    const client = clientService.update(id, req.body);

    if (!client) {
      return res.status(404).json({
        message: "Cliente não encontrado"
      });
    }

    res.json({
      message: "Cliente atualizado com sucesso",
      client
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao atualizar cliente"
    });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const deleted = clientService.remove(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Cliente não encontrado"
      });
    }

    res.json({
      message: "Cliente excluído com sucesso"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao excluir cliente"
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove
};