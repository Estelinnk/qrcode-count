import express from "express";
import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Récupère le chemin absolu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, "logs.xlsx");
const DESTINATION_URL = "https://copilot.microsoft.com/m365"; // 🔴 Remplace ici par ton vrai site

app.get("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const date = new Date();

  const workbook = new ExcelJS.Workbook();

  // Si le fichier existe, on le lit, sinon on le crée
  if (fs.existsSync(FILE_PATH)) {
    await workbook.xlsx.readFile(FILE_PATH);
  } else {
    workbook.addWorksheet("Logs");
  }

  let sheet = workbook.getWorksheet("Logs");
  if (!sheet) sheet = workbook.addWorksheet("Logs");

  // Si le fichier est vide, on ajoute une entête
  if (sheet.rowCount === 0) {
    sheet.addRow(["Date", "Adresse IP"]);
  }

  // Nouvelle ligne de log
  sheet.addRow([date.toISOString(), ip]);
  await workbook.xlsx.writeFile(FILE_PATH);

  console.log(`📥 Visite enregistrée : ${ip}`);

  // Redirection vers ton site
  res.redirect(DESTINATION_URL);
});

app.get("/logs", async (req, res) => {
  // Permet de télécharger le fichier Excel
  res.download(FILE_PATH, "logs.xlsx");
});

app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));
