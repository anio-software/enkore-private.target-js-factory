import type {API} from "#~src/targetIntegration/API.d.mts"
import type {APIContext} from "#~src/targetIntegration/APIContext.d.mts"
import type {TargetJSIdentifier} from "#~src/TargetJSIdentifier.d.mts"

import {getInitialInternalDataFactory} from "#~src/targetIntegration/public/getInitialInternalDataFactory.mts"
import {getDependenciesToInstallFactory} from "#~src/targetIntegration/public/getDependenciesToInstallFactory.mts"
import {initializeFactory} from "#~src/targetIntegration/public/initializeFactory.mts"
import {preprocessFactory} from "#~src/targetIntegration/public/preprocessFactory.mts"
import {lintFactory} from "#~src/targetIntegration/public/lintFactory.mts"
import {compileFactory} from "#~src/targetIntegration/public/compileFactory.mts"
import {generateProductFactory} from "#~src/targetIntegration/public/generateProductFactory.mts"
import {getBoilerplateFilesFactory} from "#~src/targetIntegration/public/getBoilerplateFilesFactory.mts"
import {getGitIgnoredFilesFactory} from "#~src/targetIntegration/public/getGitIgnoredFilesFactory.mts"
import {projectSourceFileFilterFactory} from "#~src/targetIntegration/public/projectSourceFileFilterFactory.mts"
import {testProductFactory} from "#~src/targetIntegration/public/testProductFactory.mts"
import {publishProductFactory} from "#~src/targetIntegration/public/publishProductFactory.mts"

import {preInitializeFactory} from "#~src/targetIntegration/public/hook/preInitializeFactory.mts"
import {preLintFactory} from "#~src/targetIntegration/public/hook/preLintFactory.mts"
import {preCompileFactory} from "#~src/targetIntegration/public/hook/preCompileFactory.mts"

export async function generateTargetIntegrationAPI(target: TargetJSIdentifier): Promise<API> {
	const apiContext: APIContext = {
		target
	}

	return {
		apiID: "EnkoreTargetIntegrationAPI",
		apiMajorVersion: 0,
		apiRevision: 0,

		getInitialInternalData: getInitialInternalDataFactory(apiContext),
		getDependenciesToInstall: getDependenciesToInstallFactory(apiContext),
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
