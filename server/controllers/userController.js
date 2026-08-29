const userService = require("../services/userService");

async function get(req, res) {
  try {
    const user = userService.getAll();

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    res.json(user);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao buscar usuário"
    });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;

    const user = userService.edit(id, req.body);

    if (!user) {
      return res.status(404).json({
        message: "Usuario não encontrado"
      });
    }

    res.json({
      message: "Usuario atualizado com sucesso",
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao atualizar usuario"
    });
  }
}

module.exports = {
  get,
  update
};