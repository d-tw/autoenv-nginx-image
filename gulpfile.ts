import webpackConfig from './webpack.config'
import webpack from 'webpack'
import { series } from 'gulp'
import { execFile, spawn } from 'child_process'
import { forEach } from 'lodash'
import { version, author, repository } from './package.json'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

export const buildWebpack = async () => {
    return new Promise<void>((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                console.error(err.stack || err)
                reject(err)
                return
            }

            if (stats === undefined) {
                reject(new Error('stats is undefined'))
                return
            }

            const out = stats.toString({
                colors: true,
            })

            if (stats.hasErrors()) {
                console.error(out)
                reject(new Error())
                return
            } else if (stats.hasWarnings()) {
                console.warn(out)
            } else {
                console.log(out)
            }
            resolve()
        })
    })
}

buildWebpack.displayName = 'build-webpack'

type GitInfo = {
    hash: string
    branch?: string | undefined
}

const git = (...args: string[]): Promise<string> =>
    new Promise((resolve, reject) => {
        execFile('git', args, (err, stdout) => (err ? reject(err) : resolve(stdout.trim())))
    })

const getGitInfo = async (): Promise<GitInfo> => {
    const hash = await git('rev-parse', 'HEAD')
    const branch = await git('rev-parse', '--abbrev-ref', 'HEAD')

    return branch === 'HEAD' ? { hash } : { hash, branch }
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

    args.push(push ? '--push' : '--load')

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
    return fs.rm('./dist', { recursive: true, force: true })
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

    // The containers rewrite the mounted HTML in place, so give them a throwaway copy
    const templatesDir = await fs.mkdtemp(path.join(os.tmpdir(), 'autoenv-html-'))
    await fs.cp('test/html_templates', templatesDir, { recursive: true })

    try {
        return await run('docker', ['compose', ...args], { AUTOENV_IMAGE: image, HTML_TEMPLATES_DIR: templatesDir })
    } finally {
        await fs.rm(templatesDir, { recursive: true, force: true })
    }
}
