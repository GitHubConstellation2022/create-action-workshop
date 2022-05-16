import { getOctokit, context } from '@actions/github';
import { getInput, setOutput, setFailed } from '@actions/core';

async function run() {
  try {
    const token = getInput('token');
    const octokit = getOctokit(token);

    const list = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner: context.repo.owner,
      repo: context.repo.repo,
      state: 'all',
    });

    const issue_stats = { open: 0, closed: 0 };
    const pull_request_stats = { open: 0, closed: 0, merged: 0 };
    console.log(list);
    for (const item of list) {
      console.log(item);
      if ('pull_request' in item) {
        if (item.state == 'open') pull_request_stats.open++;
        else if (item.merged_at == null) pull_request_stats.closed++;
        else pull_request_stats.merged++;
      }
      else {
        if (item.state == 'open') issue_stats.open++;
        else issue_stats.closed++;
      }
    }

    setOutput('pull_request_stats', pull_request_stats);
    setOutput('issue_stats', issue_stats);

  } catch (error) {
    setFailed(error.message);
  }
}

run();
