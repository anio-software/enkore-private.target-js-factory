import type {API} from "#~src/targetIntegration/API.ts"
import type {APIContext} from "#~src/targetIntegration/APIContext.ts"
import type {TargetJSIdentifier} from "#~src/TargetJSIdentifier.ts"

import {getInitialInternalDataFactory} from "#~src/targetIntegration/public/getInitialInternalDataFactory.ts"
import {getToolchainToInstallFactory} from "#~src/targetIntegration/public/getToolchainToInstallFactory.ts"
import {initializeFactory} from "#~src/targetIntegration/public/initializeFactory.ts"
import {preprocessFactory} from "#~src/targetIntegration/public/preprocessFactory.ts"
import {lintFactory} from "#~src/targetIntegration/public/lintFactory.ts"
import {compileFactory} from "#~src/targetIntegration/public/compileFactory.ts"
import {generateProductFactory} from "#~src/targetIntegration/public/generateProductFactory.ts"
import {getBoilerplateFilesFactory} from "#~src/targetIntegration/public/getBoilerplateFilesFactory.ts"
import {getGitIgnoredFilesFactory} from "#~src/targetIntegration/public/getGitIgnoredFilesFactory.ts"
import {projectSourceFileFilterFactory} from "#~src/targetIntegration/public/projectSourceFileFilterFactory.ts"
import {testProductFactory} from "#~src/targetIntegration/public/testProductFactory.ts"
import {publishProductFactory} from "#~src/targetIntegration/public/publishProductFactory.ts"

import {preInitializeFactory} from "#~src/targetIntegration/public/hook/preInitializeFactory.ts"
import {preLintFactory} from "#~src/targetIntegration/public/hook/preLintFactory.ts"
import {preCompileFactory} from "#~src/targetIntegration/public/hook/preCompileFactory.ts"

export async function generateTargetIntegrationAPI(target: TargetJSIdentifier): Promise<API> {
	const apiContext: APIContext = {
		target
	}

	return {
		apiID: "EnkoreTargetIntegrationAPI",
		apiMajorVersion: 0,
		apiRevision: 0,

		getInitialInternalData: getInitialInternalDataFactory(apiContext),
		getToolchainToInstall: getToolchainToInstallFactory(apiContext),
		initialize: initializeFactory(apiContext),
		preprocess: preprocessFactory(apiContext),
		lint: lintFactory(apiContext),
		compile: compileFactory(apiContext),
		generateProduct: generateProductFactory(apiContext),
		getBoilerplateFiles: getBoilerplateFilesFactory(apiContext),
		getGitIgnoredFiles: getGitIgnoredFilesFactory(apiContext),
		projectSourceFileFilter: projectSourceFileFilterFactory(apiContext),
		testProduct: testProductFactory(apiContext),
		publishProduct: publishProductFactory(apiContext),

		hook: {
			preInitialize: preInitializeFactory(apiContext),
			preLint: preLintFactory(apiContext),
			preCompile: preCompileFactory(apiContext),
		}
	}
}
