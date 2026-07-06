import type { PackageManager, ResolvedConfig } from './types'
import type { CommandArgs } from '@/args.ts'
import { basename } from 'node:path'
import { findUp } from 'find-up'
import { readPackageJSON } from 'pkg-types'

const LOCKFILE_PACKAGE_MANAGERS: Record<string, PackageManager> = {
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
    'package-lock.json': 'npm',
    'bun.lock': 'bun',
    'bun.lockb': 'bun',
}

export const resolvePackageManager = async (cwd: string, packageManager?: string): Promise<PackageManager> => {
    if (packageManager) {
        return packageManager.split('@')[0]! as PackageManager
    }

    const lockfile = await findUp(Object.keys(LOCKFILE_PACKAGE_MANAGERS), {
        cwd,
    })

    return LOCKFILE_PACKAGE_MANAGERS[basename(lockfile!)] ?? 'npm'
}

export const resolveConfig = async (options: CommandArgs): Promise<ResolvedConfig> => {
    const cwd = options.cwd
    const packageJSON = await readPackageJSON(cwd)
    const scripts = Object.keys(packageJSON.scripts as Record<string, string>)

    if (scripts.length === 0) {
        throw new Error(`No scripts found in ${cwd}/package.json.`)
    }

    return {
        cwd,
        scripts,
        package_manager: await resolvePackageManager(cwd, packageJSON.packageManager),
    }
}
