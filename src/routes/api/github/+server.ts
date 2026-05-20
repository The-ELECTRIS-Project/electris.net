import { error, json, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

interface GithubData {
  type: 'repository' | 'pull_request' | 'issue' | 'user';
  data: {
    owner?: string;
    repo?: string;
    name?: string;
    fullName?: string;
    description?: string;
    stars?: number;
    forks?: number;
    language?: string;
    avatarUrl?: string;
    updatedAt?: string;
    title?: string;
    number?: number;
    state?: string;
    author?: string;
    authorAvatar?: string;
    additions?: number;
    deletions?: number;
    commits?: number;
    createdAt?: string;
    login?: string;
    bio?: string;
    followers?: number;
    following?: number;
    publicRepos?: number;
    location?: string;
    company?: string;
  };
}

interface CacheEntry {
  expiresAt: number;
  data: GithubData;
}

interface GithubPrResponse {
  title: string;
  number: number;
  state: string;
  merged: boolean;
  user: { login: string; avatar_url: string };
  additions: number;
  deletions: number;
  commits: number;
  created_at: string;
}

interface GithubIssueResponse {
  title: string;
  number: number;
  state: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
}

interface GithubRepoResponse {
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  owner: { avatar_url: string };
  updated_at: string;
}

interface GithubUserResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  company: string | null;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

const RESERVED_PATHS = new Set([
  'features', 'pricing', 'trending', 'pulls', 'issues', 'marketplace',
  'explore', 'notifications', 'settings', 'orgs', 'search', 'login',
  'join', 'contact', 'about', 'site', 'security', 'resources',
  'collections', 'topics', 'readme', 'sponsors', 'watching', 'stars'
]);

async function fetchGithubApi(apiPath: string): Promise<unknown> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'electris-net-agent'
  };

  const token = env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`https://api.github.com${apiPath}`, { headers });
  
  if (!response.ok) {
    throw { status: response.status, statusText: response.statusText };
  }
  
  return response.json();
}

export const GET: RequestHandler = async ({ url }) => {
  const targetUrlStr = url.searchParams.get('url');
  
  if (!targetUrlStr) {
    throw error(400, 'Missing url parameter');
  }

  // Check cache first
  const cached = cache.get(targetUrlStr);
  if (cached && cached.expiresAt > Date.now()) {
    return json(cached.data);
  }

  try {
    const parsed = new URL(targetUrlStr);
    
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
      throw error(400, 'Only github.com URLs are supported');
    }

    const path = parsed.pathname.replace(/^\/|\/$/g, '');
    const segments = path.split('/');
    
    if (segments.length === 0 || !segments[0]) {
      throw error(400, 'Invalid GitHub URL');
    }

    const firstSegment = segments[0].toLowerCase();
    if (RESERVED_PATHS.has(firstSegment)) {
      throw error(400, 'Reserved GitHub path');
    }

    let result: GithubData | null = null;

    if (segments.length >= 4 && segments[2] === 'pull') {
      const owner = segments[0];
      const repo = segments[1];
      const number = segments[3];
      const data = (await fetchGithubApi(`/repos/${owner}/${repo}/pulls/${number}`)) as GithubPrResponse;
      
      result = {
        type: 'pull_request',
        data: {
          owner,
          repo,
          title: data.title,
          number: data.number,
          state: data.merged ? 'merged' : data.state,
          author: data.user.login,
          authorAvatar: data.user.avatar_url,
          additions: data.additions,
          deletions: data.deletions,
          commits: data.commits,
          createdAt: data.created_at
        }
      };
    } else if (segments.length >= 4 && segments[2] === 'issues') {
      const owner = segments[0];
      const repo = segments[1];
      const number = segments[3];
      const data = (await fetchGithubApi(`/repos/${owner}/${repo}/issues/${number}`)) as GithubIssueResponse;
      
      result = {
        type: 'issue',
        data: {
          owner,
          repo,
          title: data.title,
          number: data.number,
          state: data.state,
          author: data.user.login,
          authorAvatar: data.user.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      };
    } else if (segments.length >= 2) {
      const owner = segments[0];
      const repo = segments[1];
      const data = (await fetchGithubApi(`/repos/${owner}/${repo}`)) as GithubRepoResponse;
      
      result = {
        type: 'repository',
        data: {
          owner,
          name: data.name,
          fullName: data.full_name,
          description: data.description,
          stars: data.stargazers_count,
          forks: data.forks_count,
          language: data.language,
          avatarUrl: data.owner.avatar_url,
          updatedAt: data.updated_at
        }
      };
    } else {
      const username = segments[0];
      const data = (await fetchGithubApi(`/users/${username}`)) as GithubUserResponse;
      
      result = {
        type: 'user',
        data: {
          login: data.login,
          name: data.name || data.login,
          avatarUrl: data.avatar_url,
          bio: data.bio || undefined,
          followers: data.followers,
          following: data.following,
          publicRepos: data.public_repos,
          location: data.location || undefined,
          company: data.company || undefined
        }
      };
    }

    if (result) {
      cache.set(targetUrlStr, {
        expiresAt: Date.now() + CACHE_TTL,
        data: result
      });
      return json(result);
    }

    throw error(400, 'Could not determine GitHub URL type');
  } catch (err: unknown) {
    if (isHttpError(err)) {
      throw err;
    }
    
    const apiErr = err as { status?: number; statusText?: string; message?: string };
    if (apiErr.status) {
      throw error(apiErr.status, apiErr.statusText || 'Error fetching from GitHub API');
    }
    
    throw error(500, apiErr.message || 'Internal Server Error');
  }
};
