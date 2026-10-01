const entryService = require("../services/entryService");

async function create(req, res) {
  try {
    const entry = entryService.create(req.body);

    res.status(201).json({
      message: "Entrada criada com sucesso",
      entry
    });

  } catch (error) {
    console.error("Erro ao criar entrada:", error);

    res.status(500).json({
      message: "Erro ao criar entrada"
    });
  }
}

async function getAll(req, res) {
  try {
    const entries = entryService.getAll();

    res.json(entries);

  } catch (error) {
    console.error("Erro ao buscar entradas:", error);

    res.status(500).json({
      message: "Erro ao buscar entradas"
    });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const entry = entryService.getById(id);

    if (!entry) {
      return res.status(404).json({
        message: "Entrada não encontrada"
      });
    }

    res.json(entry);

  } catch (error) {
    console.error("Erro ao buscar entrada:", error);

    res.status(500).json({
      message: "Erro ao buscar entrada"
    });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const deleted = entryService.remove(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Entrada não encontrada"
      });
    }

    res.json({
      message: "Entrada excluída com sucesso"
    });

  } catch (error) {
    console.error("Erro ao excluir entrada:", error);

    res.status(500).json({
      message: "Erro ao excluir entrada"
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  remove
};