import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import {_productNameToNPMPackage} from "../_productNameToNPMPackage.ts"
import {generateNPMPackage} from "#~src/targetIntegration/generateNPMPackage.ts"
import {generateNPMTypesPackage} from "#~src/targetIntegration/generateNPMTypesPackage.ts"
import {copy, readFileJSON, writeAtomicFileJSON, isDirectorySync} from "@aniojs/node-fs"
import path from "node:path"

async function _copyNPMPackageProduct(
	projectRoot: string,
	srcProductName: string,
	newDirectory: string,
	newPackageName: string,
	newPackageVersion: string
) {
	const base = path.join(projectRoot, "products", srcProductName)

	await copy(path.join(base, "dist"), "./dist")

	if (isDirectorySync(path.join(base, "_source"))) {
		await copy(path.join(base, "_source"), "./_source")
	}

	const packageJSON: any = await readFileJSON(
		path.join(base, "package.json")
	)

	let newPackageJSON = {...packageJSON, name: newPackageName}

	newPackageJSON.version = newPackageVersion

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
	session.enkore.emitMessage("info", `building '${productName}'`)

	//
	// if we are publishing the same package under different names
	// only build it once and copy the result for the remaining packages,
	// only adjusting the package.json's name and repository fields.
	//
	// products are generated in order, 'project' and 'projectTypes' will always be built first
	//
	if (productName === "project") {
		await generateNPMPackage(
			this,
			session,
			`products/${productName}`,
			session.project.packageJSON.name
		)
	} else if (productName === "projectTypes") {
		await generateNPMTypesPackage(
			this,
			session,
			`products/${productName}`,
			session.project.packageJSON.name
		)
	} else if (productName.startsWith("npmPackage_")) {
		const [
			packageIndex,
			npmPackage
		] = _productNameToNPMPackage(session, productName)

		await _copyNPMPackageProduct(
			session.project.root,
			npmPackage.packageContents,
			`products/npmPackage_${packageIndex}`,
			npmPackage.name,
			npmPackage.version
		)
	} else {
		throw new Error(`invalid product name '${productName}'`)
	}
}

export function generateProductFactory(context: APIContext) {
	return impl!.bind(context)
}
