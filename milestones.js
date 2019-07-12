const GitHub = require('github-api');
const fs = require('fs');
const axios = require('axios');


const token = fs.readFileSync("./github-token", {encoding: 'utf-8'});

const gh = new GitHub({
  token
});

async function getMilestones(issueHandler) {
  await issueHandler.listMilestones({}, async function (err, milestones) {
    await milestones.forEach(function (milestone) {
      process.stdout.write(`Close ${milestone.title} at ${milestone.html_url}...`);

      axios.patch(milestone.url, {state: "closed"}, { headers: { Authorization: `token ${token}` } })
        .then(function (response) {
          console.log("success!");
        })
        .catch(function (error) {
          console.log("ERROR!");
          console.log(error);
        });
    });
  });
}

async function main() {
  const comitNetwork = await gh.getOrganization('comit-network');
  await comitNetwork.getRepos(async function (err, repos) {
    repos.forEach(async function (repo) {
      const issueHandler = await gh.getIssues('comit-network', repo.name);
      await getMilestones(issueHandler);
    })
  });

  const coblox = await gh.getOrganization('coblox');
  await coblox.getRepos(async function (err, repos) {
    repos.forEach(async function (repo) {
      const issues = await gh.getIssues('coblox', repo.name);
      await getMilestones(issues);
    })
  })
}

main();