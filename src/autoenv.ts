import { readFileSync } from 'fs'
import { pickBy } from 'lodash'

const defaultMode = 'autoenv'
const defaultPrefix = 'APP_'

const fail = (message: string): never => {
    console.error(`[autoenv] ${message}`)
    process.exit(1)
}

const autoenvMode = (): Record<string, unknown> => {
    const prefix = process.env.AUTOENV_PREFIX ?? defaultPrefix

    return pickBy(process.env, (_, key) => key.startsWith(prefix))
}

const fileMode = (): Record<string, unknown> => {
    const path = process.env.AUTOENV_FILE

    if (!path) {
        return fail('AUTOENV_FILE must be set when AUTOENV_MODE=file')
    }

    let parsed: unknown

    try {
        parsed = JSON.parse(readFileSync(path, 'utf8'))
    } catch (error) {
        return fail(`Unable to read JSON from ${path}: ${error}`)
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return fail(`${path} must contain a JSON object`)
    }

    return parsed as Record<string, unknown>
}

const main = () => {
    const mode = process.env.AUTOENV_MODE ?? defaultMode

    switch (mode) {
        case 'autoenv':
            console.log(JSON.stringify(autoenvMode()))
            break
        case 'file':
            console.log(JSON.stringify(fileMode()))
            break
        default:
            fail(`Unknown AUTOENV_MODE "${mode}", expected "autoenv" or "file"`)
    }
}

main()
