import express, { type Express } from "express";
import routes from "./routes";
import "./config/database";
import errorHandler from "./middlewares/errorHandler";

class App {
  public server: Express;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  // Middlewares globais
  private middlewares(): void {
    this.server.use(express.json());
  }

  // Rotas da aplicação
  private routes(): void {
    this.server.use("/api", routes);
  }

  // Tratamento global de erros
  private exceptionHandler(): void {
    this.server.use(errorHandler);
  }
}

export default new App().server;
