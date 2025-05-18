import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {_productNameToNPMPackage} from "../_productNameToNPMPackage.mts"
import {spawnSync} from "node:child_process"
import {tmpfileSync, writeAtomicFileSync, removeSync} from "@aniojs/node-fs"

const impl: API["publishProduct"] = async function(
	this: APIContext, session, productName
) {

}

export function publishProductFactory(context: APIContext) {
	return impl!.bind(context)
}
