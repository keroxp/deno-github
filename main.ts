#!/usr/bin/env deno --allow-net
import * as flags from "./vendor/https/deno.land/std/flags/mod.ts";
import { createGithubClient } from "./github.ts";

const args = flags.parse(Deno.args, {
  "--": true,
  alias: {
    h: "help"
  }
});

const command = args._.pop();
function help() {
  console.log(`
    Github Client for Deno
    
    requiredOptions:
        
        --token: personal access token for the project

    subcommands: 

        list-deployments --owner :owner --repo :repo ...
        get-deployment --owner :owner --repo :repo --id :id
        create-deployment --owner :owner --repo :repo --ref :ref ...
        create-deployment-status --owner :owner --repo :repo --state :state ...
        `);
}
async function main() {
  let result: any = {};
  if (args.help) {
    help();
    return;
  }
  const { token } = args;
  const github = createGithubClient({ token });
  if (command === "list-deployments") {
    const { owner, repo, sha, ref, task, environment } = args;
    result = await github.listDeployments(
      { owner, repo },
      { sha, ref, task, environment }
    );
  } else if (command === "get-deployment") {
    const { owner, repo, id } = args;
    result = await github.getDeployment({ owner, repo, id });
  } else if (command === "create-deployment") {
    const { owner, repo, ref } = args;
    result = await github.createDeployment({ owner, repo }, { ref });
  } else if (command === "create-deployment-status") {
    const { owner, repo, id, state } = args;
    result = await github.createDeploymentStatus(
      { owner, repo, id },
      { state }
    );
  } else {
    help();
    Deno.exit(0);
  }
  console.log(JSON.stringify(result));
}
if (import.meta.main) {
  main();
}
