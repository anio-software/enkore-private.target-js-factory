import type {EnkoreSessionAPI} from "@enkore/spec"
import type {ModuleExport as NodeMyTS} from "@aniojs-types/node-my-ts"
import type {ModuleExport as RealmUtils} from "@enkore-types/realm-js-and-web-utils"

type Dependencies = {
	"@aniojs/node-my-ts": NodeMyTS
	"@enkore/realm-js-and-web-utils": RealmUtils
}

export function getRealmDependency<T extends keyof Dependencies>(
	session: EnkoreSessionAPI,
	dependencyName: T
): Dependencies[T] {
	return session.realm.getDependency(dependencyName) as Dependencies[T]
}
