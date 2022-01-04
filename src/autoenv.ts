import { pickBy } from 'lodash'

const defaultPrefix = 'APP_'
const prefixOverride = 'AUTOENV_PREFIX'

const main = () => {
    const prefix = process.env[prefixOverride] ?? defaultPrefix
    const picked = pickBy(process.env, (_, key) => key.startsWith(prefix))

    const portKey = `${prefix}PORT`

    picked[portKey] = process.env.PORT
    picked.PORT = process.env.PORT

    console.log(JSON.stringify(picked))
}

main()
