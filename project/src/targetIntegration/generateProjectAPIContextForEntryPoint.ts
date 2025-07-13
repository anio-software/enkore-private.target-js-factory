import type {EnkoreSessionAPI} from "@anio-software/enkore-private.spec"
import type {EntryPoint} from "./InternalData.ts"
import {generateProjectAPIContext} from "#~embeds/project/generateProjectAPIContext.ts"

export async function generateProjectAPIContextForEntryPoint(
	session: EnkoreSessionAPI,
	entryPoint: EntryPoint,
	entryPointPath: string
) {
	const projectContext = await generateProjectAPIContext(
		session.project.root, false
	)

	const bundlerProjectContext = {...projectContext}

	delete bundlerProjectContext._projectEmbedFileMapRemoveMeInBundle

	return bundlerProjectContext
}
