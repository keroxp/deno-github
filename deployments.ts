import { Creator, Credential } from "./github.ts";
import { throwApiErrorIfNeeded } from "./error.ts";

/**
 * https://developer.github.com/v3/repos/deployments/
 */
export interface DeploymentsApi {
  listDeployments(params: {
    owner: string,
    repo: string,
  }, payload?: {
    sha?: string,
    ref?: string,
    task?: string,
    environment?: string
  }): Promise<Deployment[]>
  getDeployment(params: {
    owner: string,
    repo: string,
    id: number|string
  }): Promise<Deployment>
  createDeployment(params: {
    owner: string, repo: string,
  }, payload: CreateDeployment): Promise<Deployment>;
  createDeploymentStatus(
    params: {
    owner: string,
    repo: string,
    id: string,
    },
    payload: CreateDeploymentStatus
  ): Promise<DeploymentStatus>;
}

export type Deployment = {
  url: string;
  id: number;
  node_id: string;
  sha: string;
  ref: string;
  task: string;
  payload: any;
  original_environment: string;
  environment: string;
  description: string;
  creator: Creator;
  created_at: string;
  updated_at: string;
  statuses_url: string;
  repository_url: string;
  transient_environment: boolean;
  production_environment: boolean;
};

export type DeploymentStatus = {
  url: string;
  id: number;
  node_id: string;
  state: DeploymentState;
  creator: Creator;
  description: string;
  environment: string;
  target_url: string;
  created_at: string;
  updated_at: string;
  deployment_url: string;
  repository_url: string;
  environment_url: string;
  log_url: string;
};
export type CreateDeploymentStatus = {
  /**
   * @required
   * The state of the status. Can be one of error, failure, inactive, in_progress, queued pending, or success.
   * Note: To use the inactive state, you must provide the application/vnd.github.ant-man-preview+json custom media type.
   * To use the in_progress and queued states, you must provide the application/vnd.github.flash-preview+json custom media type.
   */
  state: string;
  /**
   * The target URL to associate with this status.
   * This URL should contain output to keep the user updated while the task is running or serve as historical information for what happened in the deployment.
   * @default: ""
   * Note: It's recommended to use the log_url parameter, which replaces target_url.
   */
  target_url?: string;
  /**
   * The full URL of the deployment's output.
   * This parameter replaces target_url. We will continue to accept target_url to support legacy uses, but we recommend replacing target_url with log_url.
   * Setting log_url will automatically set target_url to the same value.
   * @default: ""
   * Note: This parameter requires you to use the application/vnd.github.ant-man-preview+json custom media type.
   */
  log_url?: string;
  /**
   * A short description of the status. The maximum description length is 140 characters.
   * @default: ""
   */
  description?: string;
  /**
   * Name for the target deployment environment, which can be changed when setting a deploy status.
   * For example, production, staging, or qa.
   * Note: This parameter requires you to use the application/vnd.github.flash-preview+json custom media type.
   */

  environment?: string;
  /**
   * Sets the URL for accessing your environment.
   * @default: ""
   * Note: This parameter requires you to use the application/vnd.github.ant-man-preview+json custom media type.
   */
  environment_url?: string;
  /**
   * Adds a new inactive status to all prior non-transient, non-production environment deployments with the same repository and environment name as the created status's deployment. An inactive status is only added to deployments that had a success state. Default: true
   * Note: To add an inactive status to production environments, you must use the application/vnd.github.flash-preview+json custom media type.
   * Note: This parameter requires you to use the application/vnd.github.ant-man-preview+json custom media type.
   */
  auto_inactive?: boolean;
};
export type CreateDeployment = {
  /**
   * @required
   * The ref to deploy. This can be a branch, tag, or SHA.
   */
  ref: string;
  /**
   *  Specifies a task to execute (e.g., deploy or deploy:migrations).
   *  @default: deploy
   */
  task?: string;
  /**
   * Attempts to automatically merge the default branch into the requested ref, if it's behind the default branch.
   * @default: true
   */
  auto_merge?: boolean;
  /**
   * The status contexts to verify against commit status checks.
   * If you omit this parameter, GitHub verifies all unique contexts before creating a deployment.
   * To bypass checking entirely, pass an empty array. Defaults to all unique contexts.
   */
  required_contexts?: any[];
  /**
   * JSON payload with extra information about the deployment.
   * @default: ""
   */
  payload?: string;
  /**
   * Name for the target deployment environment (e.g., production, staging, qa).
   * @default: production
   */
  environment?: string;
  /**
   * Short description of the deployment.
   * @default: ""
   */
  description?: string;
};

export type DeploymentState =
  | "error"
  | "failure"
  | "inactive"
  | "in_progress"
  | "queued"
  | "pending";
export function deploymentsApi({token}: Credential): DeploymentsApi {
  return {
    async listDeployments({owner, repo}, payload = {}) {
      const query = new URLSearchParams();
      for (const [key,val] of Object.entries(payload)) {
        if (val !== undefined) {
          query.append(key, `${val}`);
        }
      }
      const resp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/deployments?${query.toString()}`,
        {
          method: "GET",
          headers: new Headers({
            authorization: `token ${token}`,
            "content-type": "application/json"
          }),
        }
      )
      throwApiErrorIfNeeded(resp, 200);
      return (await resp.json()) as Deployment[]
    },
    async getDeployment({owner, repo, id}) {
      const resp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/deployments/${id}`,
        {
          method: "GET",
          headers: new Headers({
            authorization: "token "+token
          }),
        }
      )
      throwApiErrorIfNeeded(resp, 200);
      return (await resp.json()) as Deployment
    },
    async createDeployment({owner, repo}, payload) {
      const resp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/deployments`,
        {
          method: "POST",
          headers: new Headers({
            autorization: "token " + token
          }),
          body: JSON.stringify(payload)
        }
      );
      await throwApiErrorIfNeeded(resp, 201);
      return (await resp.json()) as Deployment;
    },
    async createDeploymentStatus({id, owner, repo}, payload) {
      const resp = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/deployments/${id}/statuses`,
        {
          method: "POST",
          headers: new Headers({
            autorization: "token " + token
          }),
          body: JSON.stringify(payload)
        }
      );
      await throwApiErrorIfNeeded(resp, 201);
      return (await resp.json()) as DeploymentStatus;
    }
  };
}
