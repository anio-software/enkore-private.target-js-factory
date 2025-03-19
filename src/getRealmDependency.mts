import type {EnkoreSessionAPI} from "@enkore/spec"
import type {ModuleExport as NodeMyTS} from "@aniojs-types/node-my-ts"

type Dependencies = {
	"@aniojs/node-my-ts": NodeMyTS
}

export function getRealmDependency<T extends keyof Dependencies>(
	session: EnkoreSessionAPI,
	dependencyName: T
): Dependencies[T] {
	return session.realm.getDependency(dependencyName) as Dependencies[T]
}
