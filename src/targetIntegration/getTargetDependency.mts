import type {EnkoreSessionAPI} from "@enkore/spec"
import type {__ModuleExport as Toolchain} from "@enkore-types/target-js-toolchain"

type Dependencies = {
	"@enkore/target-js-toolchain": Toolchain
}

export function getTargetDependency<T extends keyof Dependencies>(
	session: EnkoreSessionAPI,
	dependencyName: T
): Dependencies[T] {
	return session.target.getDependency(dependencyName) as Dependencies[T]
}
