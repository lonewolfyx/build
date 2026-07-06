import type { ResolvedConfig } from '@/types'
import { basename, resolve } from 'node:path'
import { zip } from 'zip-a-folder'

const OUTPUT_DIR = 'dist'

export const zipBuildOutput = async (config: ResolvedConfig): Promise<string> => {
    const outputDir = resolve(config.cwd, OUTPUT_DIR)
    const artifactPath = resolve(config.cwd, `${basename(config.cwd)}.zip`)
    await zip(outputDir, artifactPath)

    return artifactPath
}
