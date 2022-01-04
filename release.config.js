const buildContainersCmd = 'yarn gulp push-container'

module.exports = {
    dryRun: false,
    branches: [{ name: 'master', channel: 'master' }],
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'conventionalcommits',
                releaseRules: [
                    { type: 'refactor', release: 'patch' },
                    { type: 'style', release: 'patch' },
                    { type: 'perf', release: 'patch' },
                    { type: 'release', release: 'patch' },
                    { type: 'release', scope: 'patch', release: 'patch' },
                    { type: 'release', scope: 'minor', release: 'minor' },
                    { type: 'release', scope: 'major', release: 'major' },
                ],
            },
        ],
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        [
            '@semantic-release/git',
            {
                // eslint-disable-next-line no-template-curly-in-string
                message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            },
        ],
        '@semantic-release/github',
        [
            '@semantic-release/exec',
            {
                verifyConditionsCmd:
                    'echo $DOCKER_TOKEN | docker login ghcr.io --username $DOCKER_USERNAME --password-stdin',
                publishCmd: buildContainersCmd,
                addChannelCmd: buildContainersCmd,
            },
        ],
    ],
}
