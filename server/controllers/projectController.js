const project = require("../services/projectService");

async function create(req, res) {
  try {
    const pro = project.create(req.body);

    res.status(201).json({
      message: "Projeto criado com sucesso",
      pro
    });

  } catch (error) {
    console.error("Erro ao criar projeto:", error);

    res.status(500).json({
      message: "Erro ao criar projeto"
    });
  }
}

async function getAll(req, res) {
  try {
    const pro = project.getAll();

    res.json(pro);

  } catch (error) {
    console.error("Erro ao buscar projeto:", error);

    res.status(500).json({
      message: "Erro ao buscar projeto"
    });
  }
}

async function updateProject(req, res) {
  try {
    const { id } = req.params;

    const pro = project.update(id, req.body);

    if (!pro) {
      return res.status(404).json({
        message: "Projeto não encontrado"
      });
    }

    res.json({
      message: "Projeto atualizado com sucesso",
      pro
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao atualizar projeto"
    });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const pro = project.getById(id);

    if (!pro) {
      return res.status(404).json({
        message: "projeto não encontrado"
      });
    }

    res.json(pro);

  } catch (error) {
    console.error("Erro ao buscar projeto:", error);

    res.status(500).json({
      message: "Erro ao buscar projeto"
    });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    const deleted = project.remove(id);

    if (!deleted) {
      return res.status(404).json({
        message: "projeto não encontrado"
      });
    }

    res.json({
      message: "projeto excluído com sucesso"
    });

  } catch (error) {
    console.error("Erro ao excluir projeto:", error);

    res.status(500).json({
      message: "Erro ao excluir entrada"
    });
  }
}

module.exports = {
  create,
  getAll,
  getById,
  remove,
  updateProject
};