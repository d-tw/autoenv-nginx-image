import webpackConfig from './webpack.config'
import webpack from 'webpack'
import rimraf from 'rimraf'
import { series } from 'gulp'
import { spawn } from 'child_process'
import { forEach } from 'lodash'
import { version, author, repository } from './package.json'
import fs from 'fs/promises'

export const buildWebpack = async () => {
    return new Promise<void>((resolve, reject) => {
        const compiler = webpack(webpackConfig)
        compiler.run(err => {
            compiler.close(err => {
                if (err !== null) {
                    reject(err)
                }
            })

            if (err !== null) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

buildWebpack.displayName = 'build-webpack'

type GitInfo = {
    hash: string
    branch?: string | undefined
}

const getGitInfo = async (): Promise<GitInfo> => {
    const rev = (await fs.readFile('.git/HEAD')).toString().trim()
    if (rev.indexOf(':') === -1) {
        return {
            hash: rev,
        }
    } else {
        const hash = (await fs.readFile('.git/' + rev.substring(5))).toString().trim()
        return {
            hash,
            branch: rev,
        }
    }
}

type Labels = 'created' | 'version' | 'authors' | 'url' | 'source' | 'revision' | 'title' | 'description'

const getLabels = async (): Promise<Record<Labels, string>> => {
    const gitInfo = await getGitInfo()

    const title = `autoenv-nginx/${version}/${gitInfo.hash}`

    return {
        version,
        created: new Date().toISOString(),
        authors: author,
        url: repository,
        source: repository,
        revision: gitInfo.hash,
        title,
        description: title,
    }
}

const registry = 'ghcr.io/d-tw/autoenv-nginx'

const run = async (command: string, args: string[], env?: Record<string, string>): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const proc = spawn(command, args, { env: { ...process.env, ...env } })

        proc.stdout.on('data', data => console.log(data.toString()))
        proc.stderr.on('data', data => console.error(data.toString()))

        proc.on('close', code => {
            if (code !== 0) {
                reject(code)
            } else {
                resolve()
            }
        })
    })
}

const buildx = async (push = false) => {
    const args: string[] = ['buildx', 'build']

    const labels = await getLabels()
    const gitInfo = await getGitInfo()

    forEach(labels, (value, label) => {
        args.push('--label', `org.opencontainers.image.${label}=${value}`)
    })

    const shaTag = `sha-${gitInfo.hash.substring(0, 8)}`
    const tags = [version, shaTag]

    switch (gitInfo.branch) {
        case 'main':
        case 'master':
            tags.push('latest')
    }

    for (const tag of tags) {
        args.push('--tag', `${registry}:${tag}`)
    }

    if (push) {
        args.push('--push')
    }

    args.push('-f', 'Dockerfile')
    args.push('dist')

    return run('docker', args)
}

export const buildContainer = async () => {
    return buildx()
}

buildContainer.displayName = 'build-container'

export const pushContainer = async () => {
    return buildx(true)
}

pushContainer.displayName = 'push-container'

export const clean = async () => {
    return new Promise<void>((resolve, reject) => {
        rimraf('./dist', err => {
            if (err === undefined || err === null) {
                resolve()
            } else {
                reject(err)
            }
        })
    })
}

export const build = series(clean, buildWebpack)

export const test = async () => {
    const args: string[] = []

    args.push('-f', 'test/docker-compose.yml')
    args.push('up')
    args.push('--force-recreate', '--remove-orphans')
    args.push('--exit-code-from', 'test_runner')
    args.push('--abort-on-container-exit')

    const image = `${registry}:${version}`

    return run('docker-compose', args, { AUTOENV_IMAGE: image })
}
