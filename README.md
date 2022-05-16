# Creating your own GitHub Action from the scratch 

## Instructions

### Prerequisites 
1. Set up Git and authenticate GitHub: [Instructions](https://docs.github.com/en/get-started/quickstart/set-up-git)

2. Any IDE like VS Code.

3. Download and install Node.js 16.x, which includes npm: https://nodejs.org/en/download/


### Steps
1. Create a new public repository on GitHub.com. see [Create a new repository](https://docs.github.com/en/articles/creating-a-new-repository).
2. Clone your repository to your computer. For more information, see [Cloning a repository](https://docs.github.com/en/articles/cloning-a-repository).
3. From your terminal, change directories into your new repository.
4. Open the folder in VS Code or any other IDE (OPTIONAL).
5. From your terminal, initialize the directory with npm to generate a `package.json` file.
    ```
    npm init -y
    ```
   In the genearted `package.json` file add this line `"type": "module"` to import ES modules. 
6. Creating an action metadata file (action.yml)
    ```yaml
    name: 'get-repo-stats'
    description: 'Get number of open & closed issues and pull requests'
    inputs:
      token:
        description: 'GITHUB_TOKEN'
        required: true
    outputs:
      issue_stats:
        description: 'Number of open and closed issues'
      pull_request_stats:
        description: 'Number of open, merged and closed pull requests'
    runs:
      using: 'node16'
      main: 'index.js'
    ```
7. Writing the action code (index.js)
    ```js
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

        for (const item of list){
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

    ```
8. Install the imported packages
    - Install @actions/core package: `npm install @actions/core@1.8.0`
    - Install @actions/github package: `npm install @actions/github@5.0.1`

9. Create workflow file in the same repository (.github/workflows/test.yml)
    ```yaml
    name: 'get repo stats'
    on: [pull_request, issues, push, workflow_dispatch]
    
    jobs:
      repo-stats:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3

          - name: get repo stats
            id: stats
            uses: ./
            with:
              token: ${{secrets.GITHUB_TOKEN}}

          - name: print repo stats
            run: |
              echo "PR stats: ${{ steps.stats.outputs.pull_request_stats }}"
              echo "PR stats: ${{ steps.stats.outputs.issue_stats }}"
    ````
10. Commit and push your changes.
    ```
    git add .
    git commit -m "My first action"
    git push  
    ```
11. Open you github repository in a browser and go to Actions tab.
12. Open the latest workflow run or trigger a new run.
13. Expand the `print repo stats` step to see the result.

## References
1. [Getting started with GitHub Actions](https://github.com/features/actions)
2. [Understanding GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)
3. [Actions Toolkit](https://github.com/actions/toolkit)
4. [Issues API](https://docs.github.com/en/rest/issues/issues#list-repository-list)
5. [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
6. [Webhook events & payloads](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads)
7. [Ocktokit API documentation](https://octokit.github.io/rest.js/v18)
8. [Creating a JavaScript Action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)

