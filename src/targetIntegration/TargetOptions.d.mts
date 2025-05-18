import type {
	EnkoreTargetJSNoneOptions,
	EnkoreTargetJSNodeOptions,
	EnkoreTargetJSWebOptions
} from "@anio-software/enkore.spec"

export type TargetOptions = EnkoreTargetJSNoneOptions |
                            EnkoreTargetJSNodeOptions |
                            EnkoreTargetJSWebOptions
