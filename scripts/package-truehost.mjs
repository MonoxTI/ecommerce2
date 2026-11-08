   import { cpSync, rmSync, existsSync, mkdirSync } from "node:fs";

   const standalone = ".next/standalone";
   if (!existsSync(standalone)) {
     console.error("✖ .next/standalone not found. Check next.config.ts has output: 'standalone'");
     process.exit(1);
   }
   rmSync("truehost-deploy", { recursive: true, force: true });
   cpSync(standalone, "truehost-deploy", { recursive: true });
   mkdirSync("truehost-deploy/.next", { recursive: true });
   cpSync(".next/static", "truehost-deploy/.next/static", { recursive: true });
   if (existsSync("public")) cpSync("public", "truehost-deploy/public", { recursive: true });
   for (const f of [".env", ".env.local", ".env.production"]) rmSync(`truehost-deploy/${f}`, { force: true });
   console.log("✔ truehost-deploy/ is ready.");