import { Request, Response } from "express";

import AuthService from "./authService";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await AuthService.register(req.body as RegisterDto);

    res.status(201).json(result);
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body as LoginDto);

    res.status(200).json(result);
  }
}

export default new AuthController();
