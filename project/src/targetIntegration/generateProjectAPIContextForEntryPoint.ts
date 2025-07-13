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

	// trim context here

	let message = `entry point '${entryPointPath}' will contain the following embeds:\n`

	for (const [embedPath] of bundlerProjectContext._projectEmbedFileMapRemoveMeInBundle!.entries()) {
		message += ` - ${embedPath}\n`
	}

	if (bundlerProjectContext._projectEmbedFileMapRemoveMeInBundle!.size) {
		session.enkore.emitMessage("info", message.slice(0, -1))
	}

	delete bundlerProjectContext._projectEmbedFileMapRemoveMeInBundle

	return bundlerProjectContext
}
