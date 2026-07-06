import type { ParsedArgs } from 'citty'

export const commandArgs = {
    cwd: {
        type: 'string',
        description: 'Current working directory',
        alias: 'c',
        default: process.cwd(),
    },
} as const

type DeepWriteable<T> = {
    -readonly [P in keyof T]: T[P] extends object ? DeepWriteable<T[P]> : T[P];
}

export type CommandArgs = ParsedArgs<DeepWriteable<typeof commandArgs>>
