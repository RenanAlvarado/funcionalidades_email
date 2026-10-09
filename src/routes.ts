import { Router } from "express";
import userRoutes from "./modules/user/user.routes";
import authRoutes from "./modules/auth/auth.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);

export default routes;
