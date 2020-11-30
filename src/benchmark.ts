import { exec } from "child_process";
import { promisify } from "util";

const execute = promisify(exec);

async function wait(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

(async function () {
  for (let i = 0; i < 2; i++) {
    for (let rels = 0; rels <= 4; rels++) {
      const port = i === 0 ? 3010 : 3000;
      const url = `http://localhost:${port}/connections?relations=${rels}`;
      const { stdout } = await execute(
        `/home/hossein/go/bin/gobench -u ${url} -c 500 -t 120`
      );

      const lines = stdout.split("\n");
      const requests = lines[3].match(/[A-Za-z0-9]+:\s+([0-9]+)/)?.[1];
      const successful = lines[3].match(/[A-Za-z0-9]+:\s+([0-9]+)/)?.[1];
      const rate = lines[7].match(/[A-Za-z0-9]+:\s+([0-9]+)/)?.[1];

      console.log(
        `Type: ${i === 0 ? "Join" : "Aggregate"}, requests: ${requests}, ` +
          `successful: ${successful}, rate: ${rate}`
      );

      await wait(5000);
    }
  }
})();
