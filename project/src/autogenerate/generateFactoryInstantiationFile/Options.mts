import type {AutogenerateAPI} from "#~src/autogenerate/AutogenerateAPI.mts"

export type Options = Parameters<AutogenerateAPI["generateFactoryFile"]>[0]
