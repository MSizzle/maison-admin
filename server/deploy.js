const { exec } = require('child_process');
const path = require('path');

function deploy() {
  return new Promise((resolve, reject) => {
    const repoPath = process.env.DEPLOY_REPO_PATH;
    const customCommand = process.env.DEPLOY_COMMAND;

    if (!repoPath) {
      return reject(new Error('DEPLOY_REPO_PATH not set in environment'));
    }

    const command = customCommand || `cd "${repoPath}" && git add -A && git commit -m "Site update $(date '+%Y-%m-%d %H:%M:%S')" && git push origin main`;

    console.log('[Deploy] Running:', command);

    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('[Deploy] Error:', error.message);
        console.error('[Deploy] stderr:', stderr);
        return reject(new Error(`Deploy failed: ${error.message}\n${stderr}`));
      }
      console.log('[Deploy] stdout:', stdout);
      resolve({ stdout, stderr });
    });
  });
}

module.exports = { deploy };
