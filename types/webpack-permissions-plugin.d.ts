declare module 'webpack-permissions-plugin' {
    import { Compiler, WebpackPluginInstance } from 'webpack'

    // Subset of types required for local usage
    type BuildFile = {
        path: string
        fileMode: string
    }

    type Options = {
        buildFiles: BuildFile[]
    }

    class PermissionsOutputPlugin implements WebpackPluginInstance {
        constructor(options: Options)
        apply: (compiler: Compiler) => void
    }

    export = PermissionsOutputPlugin
}
