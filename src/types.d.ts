export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export interface ResolvedConfig {
    cwd: string
    scripts: string[]
    package_manager: PackageManager
}
