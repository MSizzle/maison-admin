/**
 * GitHub API integration for reading/writing Moulin site files remotely.
 * Uses fine-grained PAT scoped to the moulin-a-reves repo.
 */

const GITHUB_API = 'https://api.github.com';

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g. "MSizzle/moulin-a-reves"
  if (!token || !repo) return null;
  return { token, repo };
}

function isAvailable() {
  return getConfig() !== null;
}

async function request(method, path, body) {
  const { token, repo } = getConfig();
  const url = `${GITHUB_API}/repos/${repo}${path}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

// Read a file's content (decoded from base64)
async function readFile(filePath) {
  const data = await request('GET', `/contents/${filePath}`);
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

// Write a file (commit directly to main)
async function writeFile(filePath, content, message) {
  // Get current SHA first
  let sha;
  try {
    const existing = await request('GET', `/contents/${filePath}`);
    sha = existing.sha;
  } catch {
    // File doesn't exist yet, that's fine
  }

  const body = {
    message: message || `Update ${filePath} via Maison Admin`,
    content: Buffer.from(content).toString('base64'),
    branch: 'main',
  };
  if (sha) body.sha = sha;

  return request('PUT', `/contents/${filePath}`, body);
}

// Write multiple files in a single commit using the Git Trees API
async function writeFiles(files, message) {
  const { token, repo } = getConfig();

  // 1. Get the latest commit SHA on main
  const ref = await request('GET', '/git/ref/heads/main');
  const latestCommitSha = ref.object.sha;

  // 2. Get the tree of that commit
  const commit = await request('GET', `/git/commits/${latestCommitSha}`);
  const baseTreeSha = commit.tree.sha;

  // 3. Create blobs for each file
  const tree = [];
  for (const file of files) {
    const blob = await request('POST', '/git/blobs', {
      content: file.content,
      encoding: 'utf-8',
    });
    tree.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
  }

  // 4. Create a new tree
  const newTree = await request('POST', '/git/trees', {
    base_tree: baseTreeSha,
    tree,
  });

  // 5. Create a new commit
  const newCommit = await request('POST', '/git/commits', {
    message: message || 'Site update via Maison Admin',
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  // 6. Update the ref
  await request('PATCH', '/git/ref/heads/main', {
    sha: newCommit.sha,
  });

  return newCommit;
}

module.exports = { isAvailable, readFile, writeFile, writeFiles };
