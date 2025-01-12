import { spawn } from "child_process";
import { logger } from "../utils/logger";
import { getConfig } from "../utils/get-config";
import { config as loadEnv, parse } from "dotenv";

export async function runAction(options: { config: string }, args: string[]) {
  const config = await getConfig(options.config);

  const processEnv = loadEnv().parsed ?? {};

  const env = (await config.loader({ parse, processEnv })) ?? {};

  const envCount = Object.keys(env).length;

  logger.success(`Loaded ${envCount} environment variables`);

  Object.assign(env, process.env, { FORCE_COLOR: "1", TS_ENV: "1" });

  const cmd = args.shift();
  const child = spawn(cmd!, [...args], {
    env,
    shell: true,
    stdio: "inherit",
  });

  child.on("error", (error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`Command exited with code ${code}`);
      process.exit(code!);
    }
  });
}
