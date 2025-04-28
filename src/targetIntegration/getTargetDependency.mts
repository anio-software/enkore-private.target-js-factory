import type {EnkoreSessionAPI} from "@enkore/spec"
import type {__ModuleExport as Toolchain} from "@enkore-types/target-js-toolchain"
import type {__ModuleExport as TypeScript} from "@enkore-types/typescript"
import type {__ModuleExport as Rollup} from "@enkore-types/rollup"
import type {__ModuleExport as Babel} from "@enkore-types/babel"

type Dependencies = {
	"@enkore/target-js-toolchain": Toolchain
	"@enkore/typescript": TypeScript
	"@enkore/rollup": Rollup
	"@enkore/babel": Babel
}

export function getTargetDependency<T extends keyof Dependencies>(
	session: EnkoreSessionAPI,
	dependencyName: T
): Dependencies[T] {
	return session.target.getDependency(dependencyName) as Dependencies[T]
}
