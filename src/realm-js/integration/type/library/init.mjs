import path from "node:path"
import {isRegularFileSync} from "@anio-software/fs"

import getExportedLibraryFunctions from "./fn/getExportedLibraryFunctions.mjs"
import determineSubModules from "./fn/determineSubModules.mjs"

// autogenerators
import generateLibraryFile from "./fn/autogenerator/libraryFile.mjs"
import generateDictFile from "./fn/autogenerator/dictFile.mjs"
import generateImportWithContextFile from "./fn/autogenerator/importWithContextFile.mjs"
import generateIndexFile from "./fn/autogenerator/indexFile.mjs"
import generateSupportFile from "./fn/autogenerator/supportFile.mjs"

// builders
import buildLibraryFile from "./fn/builder/libraryFile.mjs"
import buildSubModuleFile from "./fn/builder/subModuleFile.mjs"
import buildTypesFile from "./fn/builder/typesFile.mjs"

export default async function(fourtune_session) {
	const library_functions = await getExportedLibraryFunctions(fourtune_session)
	const sub_modules = determineSubModules(library_functions)

	fourtune_session.autogenerate.addFile(`library.mjs`, {
		generator: generateLibraryFile,
		generator_args: [library_functions]
	})

	fourtune_session.autogenerate.addFile(`dict.mjs`, {
		generator: generateDictFile,
		generator_args: [library_functions]
	})

	fourtune_session.autogenerate.addFile(`importWithContext.mjs`, {
		generator: generateImportWithContextFile,
		generator_args: [library_functions]
	})

	fourtune_session.autogenerate.addFile(`index.mjs`, {
		generator: generateIndexFile,
		generator_args: [library_functions]
	})

	for (const support_file of [
		"wrapFunction.mjs",
		"wrapFactory.mjs",
		"createModifierFunction.mjs",
		"createNamedAnonymousFunction.mjs"
	]) {
		fourtune_session.autogenerate.addFile(`support_files/${support_file}`, {
			generator: generateSupportFile,
			generator_args: [support_file]
		})
	}

	fourtune_session.distributables.addFile(`library.mjs`, {
		generator: buildLibraryFile,
		generator_args: []
	})

	fourtune_session.distributables.addFile(`library.min.mjs`, {
		generator: buildLibraryFile,
		generator_args: [true]
	})

	for (const sub_module of sub_modules) {
		fourtune_session.distributables.addFile(`submodule/${sub_module}.mjs`, {
			generator: buildSubModuleFile,
			generator_args: [library_functions, sub_module]
		})
	}

	const types_path = path.join(fourtune_session.getProjectRoot(), "build", "src", "index.d.ts")

	if (isRegularFileSync(types_path)) {
		fourtune_session.distributables.addFile(`index.d.ts`, {
			generator: buildTypesFile,
			generator_args: []
		})
	}

	/*
	//state.files.autogenerate.push(["NOTICE.txt", createNoticeFile, {autogen_warning_comment: false}])
	//state.files.autogenerate.push(["VERSION.txt", createVersionFile, {autogen_warning_comment: false}])
	*/
}
