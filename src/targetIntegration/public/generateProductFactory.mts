import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {_productNameToNPMPackage} from "../_productNameToNPMPackage.mts"
import {generateNPMPackage} from "#~src/targetIntegration/generateNPMPackage.mts"
import {generateNPMTypesPackage} from "#~src/targetIntegration/generateNPMTypesPackage.mts"
import {copy, readFileJSON, writeAtomicFileJSON} from "@aniojs/node-fs"
import path from "node:path"

async function _copyNPMPackageProduct(
	projectRoot: string,
	srcProductName: string,
	newDirectory: string,
	newPackageName: string
) {
	const base = path.join(
		projectRoot, "products", srcProductName
	)

	await copy(path.join(base, "dist"), "./dist")

	const packageJSON: any = await readFileJSON(
		path.join(base, "package.json")
	)

	let newPackageJSON = {...packageJSON, name: newPackageName}

	if ("repository" in newPackageJSON) {
		newPackageJSON.repository.directory = newDirectory
	}

	await writeAtomicFileJSON(
		"./package.json", newPackageJSON, {pretty: true}
	)
}

const impl: API["generateProduct"] = async function(
	this: APIContext, session, productName
) {
	const [
		packageIndex,
		npmPackage
	] = _productNameToNPMPackage(session, productName)
	const isTypesPackage = productName.startsWith("npmTypesPackage_")

	session.enkore.emitMessage(
		"info", `building '${productName}' with npmPackageName='${npmPackage.name}'`
	)

	//
	// if we are publishing the same package under different names
	// only build it once and copy the result for the remaining packages,
	// only adjusting the package.json's name and repository fields.
	//
	// products are generated in order, so npmXXXPackage_0 will always be built first
	//
	if (packageIndex === 0) {
		if (isTypesPackage) {
			await generateNPMTypesPackage(
				this,
				session,
				`products/${productName}`,
				npmPackage.name
			)
		} else {
			await generateNPMPackage(
				this,
				session,
				`products/${productName}`,
				npmPackage.name
			)
		}

		return
	}

	await _copyNPMPackageProduct(
		session.project.root,
		isTypesPackage ? "npmTypesPackage_0" : "npmPackage_0",
		`products/${productName}`,
		npmPackage.name
	)
}

export function generateProductFactory(context: APIContext) {
	return impl!.bind(context)
}
