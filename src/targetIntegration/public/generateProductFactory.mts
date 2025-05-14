import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import {generateNPMPackage} from "#~src/targetIntegration/generateNPMPackage.mts"
import {
	generateNPMTypesPackage,
	generateNPMTypesPackageName
} from "#~src/targetIntegration/generateNPMTypesPackage.mts"
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
	if (!productName.startsWith("npmPackage_") &&
		!productName.startsWith("npmTypesPackage_")
	) {
		throw new Error(`Invalid product name '${productName}'.`)
	}

	const productPackageType: "pkg" | "typePkg" = (() => {
		if (productName.startsWith("npmPackage_")) {
			return "pkg"
		}

		return "typePkg"
	})()

	const packageNameIndex: number = (() => {
		if (productPackageType === "pkg") {
			return parseInt(
				productName.slice("npmPackage_".length), 10
			)
		}

		return parseInt(
			productName.slice("npmTypesPackage_".length), 10
		)
	})()

	// todo: check index
	const packageName = packageNames[packageNameIndex]

	//
	// if we are publishing the same package under different names
	// only build it once and copy the result for the remaining packages,
	// only adjusting the package.json's name and repository fields.
	//
	// products are generated in order, so npmXXXPackage_0 will always be built first
	//
	if (packageNameIndex === 0) {
		if (productPackageType === "pkg") {
			await generateNPMPackage(
				this,
				session,
				`products/${productName}`,
				packageName
			)
		} else {
			await generateNPMTypesPackage(
				this,
				session,
				`products/${productName}`,
				packageName
			)
		}

		return
	}

	if (productPackageType === "typePkg") {
		const typePackageName = generateNPMTypesPackageName(
			this, session, packageName
		)

		await _copyNPMPackageProduct(
			session.project.root,
			"npmTypesPackage_0",
			`products/${productName}`,
			typePackageName
		)

		return
	}

	await _copyNPMPackageProduct(
		session.project.root,
		"npmPackage_0",
		`products/${productName}`,
		packageName
	)
}

export function generateProductFactory(context: APIContext) {
	return impl!.bind(context)
}
