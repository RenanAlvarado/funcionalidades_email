import { Request, Response } from "express";
import { UpdateUserDto } from "./dto/updateUser.dto";
import UserService from "./userService";

class UserController {
  // Listar usuários
  async index(_req: Request, res: Response): Promise<void> {
    const users = await UserService.index();

    res.status(200).json(users);
  }

  // Buscar usuário por ID
  async show(req: Request, res: Response): Promise<void> {
    const user = await UserService.show(Number(req.params.id));

    res.status(200).json(user);
  }

  // Atualizar usuário
  async update(req: Request, res: Response): Promise<void> {
    const user = await UserService.update(
      Number(req.params.id),
      req.body as UpdateUserDto,
    );

    res.status(200).json(user);
  }

  // Excluir usuário
  async delete(req: Request, res: Response): Promise<void> {
    await UserService.delete(Number(req.params.id));

    res.sendStatus(204);
  }
}

export default new UserController();
