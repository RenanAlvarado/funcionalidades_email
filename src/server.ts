import "dotenv/config";
import app from "./app";
import database from "./config/database";

const PORT = Number(process.env.PORT ?? 3000);

async function startServer(): Promise<void> {
  try {
    await database.initialize();

    console.log("Conexão com MySQL estabelecida!");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar a aplicação:", error);
    process.exit(1);
  }
}

startServer();
