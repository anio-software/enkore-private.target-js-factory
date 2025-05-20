import type {
	EnkoreTargetJSNoneOptions,
	EnkoreTargetJSNodeOptions,
	EnkoreTargetJSWebOptions
} from "@anio-software/enkore-private.spec"

export type TargetOptions = EnkoreTargetJSNoneOptions |
                            EnkoreTargetJSNodeOptions |
                            EnkoreTargetJSWebOptions
