
const userService = require("../services/userService");

async function get(req, res) {
  try {
    const user = userService.getAll();

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      message: "Erro ao buscar usuário",
    });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "ID do usuário inválido",
      });
    }

    const user = userService.edit(id, req.body);

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    return res.json({
      message: "Usuário atualizado com sucesso",
      user,
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    return res.status(500).json({
      message: "Erro ao atualizar usuário",
    });
  }
}

module.exports = {
  get,
  update,
};
