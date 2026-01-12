import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const autoenvFsPath = process.env.AUTOENV_FS_PATH || '/usr/share/nginx/autoenv/autoenv.json'
const injectEnabled = process.env.AUTOENV_INJECT_HTML !== 'false'
const globalVarName = process.env.AUTOENV_GLOBAL_VAR || 'window.__CONFIG__'
const searchPath = process.env.AUTOENV_HTML_SEARCH_PATH || '/app'

const log = (message: string) => {
    console.log(`[injectConfig] ${message}`)
}

const findHtmlFiles = (directory: string): string[] => {
    const htmlFiles: string[] = []

    if (!existsSync(directory)) {
        log(`Search directory does not exist: ${directory}`)
        return htmlFiles
    }

    const searchDirectory = (dir: string) => {
        try {
            const items = readdirSync(dir)

            for (const item of items) {
                const fullPath = join(dir, item)
                const stat = statSync(fullPath)

                if (stat.isDirectory()) {
                    searchDirectory(fullPath)
                } else if (item.endsWith('.html')) {
                    htmlFiles.push(fullPath)
                }
            }
        } catch (error) {
            log(`Error reading directory ${dir}: ${error}`)
        }
    }

    searchDirectory(directory)
    return htmlFiles
}

const injectConfigIntoHtml = (htmlPath: string, config: any) => {
    try {
        const htmlContent = readFileSync(htmlPath, 'utf-8')
        const configScript = `<script>${globalVarName} = ${JSON.stringify(config)};</script>`

        // Check if config has already been injected
        if (htmlContent.includes(globalVarName)) {
            log(`Config already injected in ${htmlPath}, skipping`)
            return true
        }

        let modifiedContent = htmlContent

        // Try to inject before </head>
        if (htmlContent.includes('</head>')) {
            modifiedContent = htmlContent.replace('</head>', `${configScript}\n</head>`)

            // If no </head>, try to inject after <head>
        } else if (htmlContent.includes('<head>')) {
            modifiedContent = htmlContent.replace('<head>', `<head>\n${configScript}`)

            // If no <head> tags, try to inject after <html>
        } else if (htmlContent.includes('<html>')) {
            modifiedContent = htmlContent.replace('<html>', `<html>\n${configScript}`)

            // As a fallback, inject at the very beginning of the body or document
        } else if (htmlContent.includes('<body>')) {
            modifiedContent = htmlContent.replace('<body>', `<body>\n${configScript}`)

            // Last resort: inject at the beginning of the file
        } else {
            modifiedContent = `${configScript}\n${htmlContent}`
        }

        // Only write if content actually changed
        if (modifiedContent !== htmlContent) {
            writeFileSync(htmlPath, modifiedContent, 'utf-8')
            log(`Successfully injected config into ${htmlPath}`)
            return true
        } else {
            log(`No injection performed for ${htmlPath} (no suitable injection point found)`)
            return false
        }
    } catch (error) {
        log(`Error processing ${htmlPath}: ${error}`)
        return false
    }
}

const main = () => {
    log('Starting HTML config injection...')

    if (!injectEnabled) {
        log('HTML injection is disabled via AUTOENV_INJECT_HTML=false')
        return
    }

    if (!existsSync(autoenvFsPath)) {
        log(`Config file not found: ${autoenvFsPath}`)
        return
    }

    try {
        const configContent = readFileSync(autoenvFsPath, 'utf-8')
        const config = JSON.parse(configContent)

        log(`Loaded config from ${autoenvFsPath}`)
        log(`Searching for .html files in ${searchPath}`)

        const htmlFiles = findHtmlFiles(searchPath)

        if (htmlFiles.length === 0) {
            log(`No .html files found in ${searchPath}`)
            return
        }

        log(`Found ${htmlFiles.length} .html file(s): ${htmlFiles.join(', ')}`)

        let successCount = 0
        for (const htmlFile of htmlFiles) {
            if (injectConfigIntoHtml(htmlFile, config)) {
                successCount++
            }
        }

        log(`Config injection completed: ${successCount}/${htmlFiles.length} files processed successfully`)
    } catch (error) {
        log(`Error reading or parsing config file: ${error}`)
        process.exit(1)
    }
}

// Always run the main function when this module is loaded
main()
