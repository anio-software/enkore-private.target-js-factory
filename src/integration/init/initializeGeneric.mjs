import {_initializeObjectCreation} from "./_initializeObjectCreation.mjs"
import {_checkProjectPackageJSON} from "./_checkProjectPackageJSON.mjs"
import {_orderProjectPackageJSON} from "./_orderProjectPackageJSON.mjs"
import {_autogenerateTSConfigFiles} from "./_autogenerateTSConfigFiles.mjs"

export async function initializeGeneric(
	fourtune_session
) {
	await _checkProjectPackageJSON(fourtune_session)
	await _orderProjectPackageJSON(fourtune_session)

	await _initializeObjectCreation(fourtune_session)
	await _autogenerateTSConfigFiles(fourtune_session)
}
