import {generateProjectAPIContext} from "#~assets/project/generateProjectAPIContext.mts"
import {generateProjectAPIFromContext} from "#~assets/project/generateProjectAPIFromContext.mts"

import type {ProjectAPI} from "#~assets/project/ProjectAPI.d.mts"

export async function generateProjectAPI(
	userProjectRoot: string | ["inferFromCLIArgs"]
): Promise<ProjectAPI> {
	return await generateProjectAPIFromContext(
		await generateProjectAPIContext(userProjectRoot, true)
	)
}
