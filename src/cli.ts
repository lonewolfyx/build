import process from 'node:process'
import { intro, log, outro } from '@clack/prompts'
import { createMain, defineCommand } from 'citty'
import { zipBuildOutput } from '@/archive.ts'
import { commandArgs } from '@/args.ts'
import { resolveBuildScript, runBuildScript } from '@/scripts.ts'
import { description, name, version } from '../package.json'
import { resolveConfig } from './config'

const command = defineCommand({
    meta: {
        name,
        version,
        description,
    },
    args: commandArgs,
    async run({ args }) {
        intro('@lonewolfyx/build')

        try {
            log.info(`Reading project config from ${args.cwd}`)
            const config = await resolveConfig(args)

            log.success(`Detected ${config.package_manager} with ${config.scripts.length} script(s).`)

            const script = await resolveBuildScript(config.scripts)
            await runBuildScript(config, script)

            const artifactPath = await zipBuildOutput(config)
            outro(`Build artifact created: ${artifactPath}`)
        }
        catch (error) {
            log.error(error instanceof Error ? error.message : String(error))
            process.exit(1)
        }
    },
})

createMain(command)({})
