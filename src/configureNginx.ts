import { template } from 'lodash'
import path from 'path'
import fs from 'fs/promises'

const templatePath = path.join(__dirname, 'templates', 'nginx.conf.tpl')
const configPath = process.env.NGINX_CONF_PATH

const main = async () => {
    const data = await fs.readFile(templatePath, 'utf8')
    const templateFn = template(data)

    const templateArgs = {
        port: process.env.PORT,
        autoenvHttpPath: process.env.AUTOENV_HTTP_PATH,
        autoenvFsPath: process.env.AUTOENV_FS_PATH,
    }

    if (configPath === undefined) {
        throw new Error('Undefined config path')
    }

    fs.writeFile(configPath, templateFn(templateArgs))
}

main()
