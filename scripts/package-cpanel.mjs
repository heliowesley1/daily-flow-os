import { mkdir, copyFile, cp, rename } from "node:fs/promises";
await mkdir("release/web/api", { recursive: true });
await rename("release/web/portable.html", "release/web/index.html");
for (const file of ["index.php", "config.example.php", ".htaccess"])
  await copyFile("hosting/api/" + file, "release/web/api/" + file);
await copyFile("hosting/.htaccess", "release/web/.htaccess");
await copyFile("hosting/database.sql", "release/database.sql");
await copyFile("hosting/INSTALACAO.md", "release/INSTALACAO.md");
console.log("Pacote cPanel preparado: release/web + release/database.sql + release/INSTALACAO.md");
