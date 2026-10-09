import { Router } from "express";
import { validateBody } from "../../middlewares/validateBody";

import { updateUserDto } from "./dto/updateUser.dto";
import UserController from "./userController";

const userRoutes = Router();

userRoutes.get("/", UserController.index.bind(UserController));

userRoutes.get("/:id", UserController.show.bind(UserController));

userRoutes.put(
  "/:id",
  validateBody(updateUserDto),
  UserController.update.bind(UserController),
);

userRoutes.delete("/:id", UserController.delete.bind(UserController));

export default userRoutes;
