const GitHub = require('github-api');

const gh = new GitHub({
  token: '23ec0e8b192e91fc2e94d9d46faa39ac9703f34f'
});


async function getIssues(issueHandler) {
  await issueHandler.listIssues({
    state: "closed",
    since: "2019-04-30T00:00:00Z",
    sort: "updated",
    direction: "asc"
  }, async function (err, issues) {
    await issues.forEach(function (issue, index) {
      if (issue.closed_at) {
        let date = new Date(issue.closed_at);
        if (date.getMonth() === 4 // 4 is May
          && date.getFullYear() === 2019
          // if pull_request field is present, it's a PR
          && !issue.pull_request) {
          const {milestone, title, number, html_url} = issue;
          const milestoneTitle = milestone ? milestone.title : "";
          const text = "- " + milestoneTitle + " [(" + number + ")](" + html_url + ") " + title;

          console.log(text);
        }
      }
    });
  });
}

async function printIssues() {
  const comitNetwork = await gh.getOrganization('comit-network');
  await comitNetwork.getRepos(async function (err, repos) {
    repos.forEach(async function (repo, index) {
      if (!repo.private) {
        const issueHandler = await gh.getIssues('comit-network', repo.name);
        await getIssues(issueHandler);
      }
    })
  });

  const coblox = await gh.getOrganization('coblox');
  await coblox.getRepos(async function (err, repos) {
    repos.forEach(async function (repo, index) {
      if (!repo.private) {
        const issues = await gh.getIssues('coblox', repo.name);
        await getIssues(issues);
      }
    })
  })
}

async function listPullRequests() {
  const repo = await gh.getRepo('comit-network', 'comit-rs');
  repo.listPullRequests({state: "closed", per_page: 100, page: 1}, async function (error, result, request) {
    result.forEach(async function (pr, index) {
      if (pr.user.login !== "D4nte"
        && pr.user.login !== "bonomat"
        && pr.user.login !== "luckysori"
        && pr.user.login !== "thomaseizinger"
        && pr.user.login !== "LLFourn"
      ) {
        const text = " [(" + pr.number + ")](" + pr.html_url + ") " + "[" + pr.user.login + "](" + pr.user.html_url + ") " + pr.title;
        console.log(text);
      }
    })
  });
}

printIssues();
//listPullRequests();