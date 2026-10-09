const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("A variável JWT_SECRET não foi configurada.");
}

export default jwtSecret;
