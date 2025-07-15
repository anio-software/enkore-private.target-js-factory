import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {APIContext} from "./APIContext.ts"
import {getInternalData} from "./getInternalData.ts"
import {generateProjectAPIContext} from "./generateProjectAPIContext.ts"
import {updateEntryPointsMap} from "./updateEntryPointsMap.ts"

export async function _postCompileHookRemoveMeInFuture(
	apiContext: APIContext,
	session: EnkoreSessionAPI
) {
	const internalData = getInternalData(session)

	if (internalData.projectAPIContext !== null) {
		throw new Error(`Invalid internal state, projectAPIContext must be null.`)
	}

	session.enkore.emitMessage("info", "generating project api context")

	internalData.projectAPIContext = await generateProjectAPIContext(
		session.project.root, false
	)

	session.enkore.emitMessage("info", "updating entry points map")

	await updateEntryPointsMap(apiContext, internalData.projectAPIContext, session)
}
