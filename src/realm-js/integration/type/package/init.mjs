import buildPackageFile from "./fn/builder/packageFile.mjs"
import buildTypesFile from "./fn/builder/typesFile.mjs"
import path from "node:path"
import {isRegularFileSync} from "@anio-software/fs"

async function handleAdditionalEntryPoints(fourtune_session, entry_points) {
	for (const output in entry_points) {
		const entry_point = entry_points[output]

		fourtune_session.distributables.addFile(`additional_entry_points/${output}/package.mjs`, {
			generator: buildPackageFile,
			generator_args: [path.join("build", entry_point), false]
		})

		fourtune_session.distributables.addFile(`additional_entry_points/${output}/package.min.mjs`, {
			generator: buildPackageFile,
			generator_args: [path.join("build", entry_point), true]
		})
	}
}

export default async function(fourtune_session) {
	const project_config = fourtune_session.getProjectConfig()

	fourtune_session.distributables.addFile(`package.mjs`, {
		generator: buildPackageFile,
		generator_args: ["build/src/index.mjs", false]
	})

	fourtune_session.distributables.addFile(`package.min.mjs`, {
		generator: buildPackageFile,
		generator_args: ["build/src/index.mjs", true]
	})

	const additional_entry_points = project_config?.target?.additional_entry_points

	if (additional_entry_points) {
		await handleAdditionalEntryPoints(fourtune_session, additional_entry_points)
	}

	const types_path = path.join(fourtune_session.getProjectRoot(), "build", "src", "index.d.ts")

	if (!isRegularFileSync(types_path)) {
		return
	}

	fourtune_session.distributables.addFile(`index.d.ts`, {
		generator: buildTypesFile,
		generator_args: []
	})
}
