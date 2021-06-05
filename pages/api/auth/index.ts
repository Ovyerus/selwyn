import { methods } from "avoca";

const scopes = "read:user user:email";
const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=${scopes}`;

export default methods({
  get(req, res) {
    // TODO: check if user has token already and early redir to dash?
    res.redirect(githubUrl);
  },
});
