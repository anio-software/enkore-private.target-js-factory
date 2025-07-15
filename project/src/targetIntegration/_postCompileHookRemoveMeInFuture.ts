import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.ts"
import {getInternalData} from "./getInternalData.ts"
import {generateProjectAPIContext} from "./generateProjectAPIContext.ts"

export async function _postCompileHookRemoveMeInFuture(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const internalData = getInternalData(session)

	if (internalData.projectAPIContext !== null) {
		throw new Error(`Invalid internal state, projectAPIContext must be null.`)
	}

	internalData.projectAPIContext = await generateProjectAPIContext(
		session.project.root, false
	)
}
