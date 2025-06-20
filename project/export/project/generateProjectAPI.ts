import {generateProjectAPIContext} from "#~embeds/project/generateProjectAPIContext.mts"
import {generateProjectAPIFromContextNode} from "#~embeds/project/generateProjectAPIFromContextNode.mts"

import type {ProjectAPI} from "#~embeds/project/ProjectAPI.d.mts"

export async function generateProjectAPI(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<ProjectAPI> {
	return await generateProjectAPIFromContextNode(
		await generateProjectAPIContext(userProjectRoot, true)
	)
}
