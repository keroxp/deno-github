import { DeploymentsApi, deploymentsApi } from "./deployments.ts";

export interface Credential {
  token: string;
}

export type Creator = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
};

export interface GithubClient extends Credential, DeploymentsApi {}

export function createGithubClient(credential: Credential): GithubClient {
  return {
    ...credential,
    ...deploymentsApi(credential)
  };
}
