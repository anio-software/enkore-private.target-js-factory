import {generateProjectAPIContext} from "#~assets/project/generateProjectAPIContext.mts"
import {generateProjectAPIFromContextNode} from "#~assets/project/generateProjectAPIFromContextNode.mts"

import type {ProjectAPI} from "#~assets/project/ProjectAPI.d.mts"

export async function generateProjectAPI(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<ProjectAPI> {
	return await generateProjectAPIFromContextNode(
		await generateProjectAPIContext(userProjectRoot, true)
	)
}
