import type {EnkoreSessionAPI} from "@enkore/spec"
import type {__ModuleExport as TypeScript} from "@enkore-types/typescript"
import type {__ModuleExport as Rollup} from "@enkore-types/rollup"

type Dependencies = {
	"@enkore/typescript": TypeScript
	"@enkore/rollup": Rollup
}

export function getRealmDependency<T extends keyof Dependencies>(
	session: EnkoreSessionAPI,
	dependencyName: T
): Dependencies[T] {
	return session.target.getDependency(dependencyName) as Dependencies[T]
}
