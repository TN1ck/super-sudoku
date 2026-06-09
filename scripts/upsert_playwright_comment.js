import fs from "node:fs";

const marker = "<!-- playwright-e2e-summary -->";
const summaryPath = process.argv[2] ?? "playwright-summary.md";
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const branch = process.env.GITHUB_REF_NAME;
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER;
const apiBaseUrl = process.env.GITHUB_API_URL ?? "https://api.github.com";

function canPostComment() {
  return token && repository && branch && repositoryOwner && fs.existsSync(summaryPath);
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error(`${options.method ?? "GET"} ${path} failed with ${response.status}: ${await response.text()}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

async function findPullRequest(owner, repo) {
  const params = new URLSearchParams({
    head: `${repositoryOwner}:${branch}`,
    state: "open",
    per_page: "1",
  });
  const pullRequests = await request(`/repos/${owner}/${repo}/pulls?${params}`);

  return pullRequests[0];
}

async function findExistingComment(owner, repo, issueNumber) {
  const comments = await request(`/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`);

  return comments.find(
    (comment) => comment.user?.login === "github-actions[bot]" && String(comment.body ?? "").includes(marker),
  );
}

async function upsertComment() {
  if (!canPostComment()) {
    console.log("Skipping Playwright PR comment because required GitHub context or summary file is missing.");
    return;
  }

  const [owner, repo] = repository.split("/");
  const pullRequest = await findPullRequest(owner, repo);

  if (!pullRequest) {
    console.log(`No open pull request found for ${repositoryOwner}:${branch}; skipping Playwright PR comment.`);
    return;
  }

  const summary = fs.readFileSync(summaryPath, "utf8").trim();
  const body = `${marker}\n\n${summary}`;
  const existingComment = await findExistingComment(owner, repo, pullRequest.number);

  if (existingComment) {
    await request(`/repos/${owner}/${repo}/issues/comments/${existingComment.id}`, {
      method: "PATCH",
      body: JSON.stringify({body}),
    });
    console.log(`Updated Playwright summary comment on PR #${pullRequest.number}.`);
    return;
  }

  await request(`/repos/${owner}/${repo}/issues/${pullRequest.number}/comments`, {
    method: "POST",
    body: JSON.stringify({body}),
  });
  console.log(`Created Playwright summary comment on PR #${pullRequest.number}.`);
}

try {
  await upsertComment();
} catch (error) {
  if (error.status === 403) {
    console.log("Skipping Playwright PR comment because the GitHub token cannot write PR comments.");
  } else {
    throw error;
  }
}
