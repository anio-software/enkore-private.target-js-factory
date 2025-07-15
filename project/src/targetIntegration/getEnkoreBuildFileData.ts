import {
	type EnkoreSessionAPI,
	type EnkoreBuildInfoFile,
	type EnkoreLockFile,
	createEntity
} from "@anio-software/enkore-private.spec"
import {readEntityJSONFile} from "@anio-software/enkore-private.spec/utils"
import type {APIContext} from "./APIContext.ts"
import {getToolchain} from "#~src/getToolchain.ts"
import {resolveImportSpecifierFromProjectRoot} from "@anio-software/enkore-private.spec/utils"
import {readFileJSONSync} from "@anio-software/pkg.node-fs"
import path from "node:path"

type GitInformation = EnkoreBuildInfoFile["git"]
type EnkoreVersions = EnkoreBuildInfoFile["versions"]

// since those are new APIs we have to provide basic backwards compatibility
function getGitInformation(session: EnkoreSessionAPI): GitInformation {
	if ("git" in session) {
		if (session.git) {
			return {
				commit: session.git.commitHash
			}
		}

		return null
	}

	session.enkore.emitMessage("warning", `providing backwards compat for session.git property.`)

	return null
}

function getVersionOfPackage(projectRoot: string, moduleSpecifier: string): string {
	const resolved = resolveImportSpecifierFromProjectRoot(
		projectRoot, `${moduleSpecifier}/package.json`
	)

	if (!resolved) {
		return "N/A"
	}

	const packageJSON = readFileJSONSync(resolved)

	return (packageJSON as any).version
}

function getEnkoreVersions(apiContext: APIContext, session: EnkoreSessionAPI): EnkoreVersions {
	if ("getVersions" in session.enkore) {
		return session.enkore.getVersions()
	}

	// @ts-ignore:next-line
	session.enkore.emitMessage("warning", `providing backwards compat for session.enkore.getVersions().`)

	return {
		enkore: getVersionOfPackage(session.project.root, "@anio-software/enkore"),
		core: getVersionOfPackage(session.project.root, "@anio-software/enkore.core"),
		target: getVersionOfPackage(session.project.root, `@anio-software/enkore.target-${apiContext.target}`)
	}
}

async function getEnkoreLockFile(session: EnkoreSessionAPI): Promise<EnkoreLockFile> {
	if ("getLockFile" in session.enkore) {
		return session.enkore.getLockFile()
	}

	// @ts-ignore:next-line
	session.enkore.emitMessage("warning", `providing backwards compat for session.enkore.getLockFile().`)

	return await readEntityJSONFile(
		path.join(session.project.root, "enkore-lock.json"),
		"EnkoreLockFile"
	)
}

function getActualToolchain(session: EnkoreSessionAPI): [string, number] {
	const toolchain = getToolchain(session) as any

	return [toolchain.toolchainID, toolchain.toolchainRev]
}

export async function getEnkoreBuildFileData(
	apiContext: APIContext,
	session: EnkoreSessionAPI
): Promise<EnkoreBuildInfoFile> {
	return createEntity("EnkoreBuildInfoFile", 0, 0, {
		createdAt: Date.now(),
		git: getGitInformation(session),
		versions: getEnkoreVersions(apiContext, session),
		actualToolchain: getActualToolchain(session),
		lockFile: await getEnkoreLockFile(session),
		environment: {
			nodeVersion: process.versions.node,
			npmVersion: "N/A",
			platform: process.platform
		},
		target: apiContext.target
	})
}
