import {generateProjectAPIContext} from "#~embeds/project/generateProjectAPIContext.ts"
import {generateProjectAPIFromContextNode} from "#~embeds/project/generateProjectAPIFromContextNode.ts"

import type {ProjectAPI} from "#~embeds/project/ProjectAPI.ts"

export async function generateProjectAPI(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<ProjectAPI> {
	return await generateProjectAPIFromContextNode(
		await generateProjectAPIContext(userProjectRoot, true)
	)
}
