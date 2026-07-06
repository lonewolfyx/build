import type { PackageManager, ResolvedConfig } from '@/types'
import { spawn } from 'node:child_process'
import process from 'node:process'
import { cancel, isCancel, log, select } from '@clack/prompts'

export const createRunCommand = (
    packageManager: PackageManager,
    script: string,
): { command: string, args: string[] } => {
    switch (packageManager) {
        case 'pnpm':
            return { command: 'pnpm', args: ['run', script] }
        case 'yarn':
            return { command: 'yarn', args: ['run', script] }
        case 'bun':
            return { command: 'bun', args: ['run', script] }
        case 'npm':
        default:
            return { command: 'npm', args: ['run', script] }
    }
}

export const resolveBuildScript = async (scripts: string[]): Promise<string> => {
    if (scripts.includes('build')) {
        log.info('Using build script: build')
        return 'build'
    }

    const buildScripts = scripts
        .filter(script => script.startsWith('build'))
        .sort((a, b) => a.localeCompare(b))

    if (buildScripts.length === 0) {
        throw new Error('No build script found. Expected "build" or a script whose name starts with "build".')
    }

    const selectedScript = await select({
        message: 'Select a build script',
        options: buildScripts.map(script => ({
            label: script,
            value: script,
        })),
    })

    if (isCancel(selectedScript)) {
        cancel('Operation cancelled.')
        process.exit(1)
    }

    return selectedScript
}

export const runBuildScript = async (config: ResolvedConfig, script: string): Promise<void> => {
    const command = createRunCommand(config.package_manager, script)

    log.info(`Running: ${command.command} ${command.args.join(' ')}`)

    const exitCode = await new Promise<number>((resolvePromise, reject) => {
        const child = spawn(command.command, command.args, {
            cwd: config.cwd,
            shell: process.platform === 'win32',
            stdio: 'inherit',
        })

        child.on('error', (error) => {
            reject(new Error(`Failed to start ${config.package_manager}. Make sure it is installed. ${error}`))
        })

        child.on('close', (code, signal) => {
            if (signal) {
                resolvePromise(1)
                return
            }

            resolvePromise(code ?? 1)
        })
    })

    if (exitCode !== 0) {
        throw new Error(`Build command failed with exit code ${exitCode}.`)
    }
}
