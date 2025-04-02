import type {API} from "#~src/API.d.mts"
import type {APIContext} from "#~src/APIContext.d.mts"

import {getInitialInternalDataFactory} from "#~src/public/getInitialInternalDataFactory.mts"
import {getDependenciesToInstallFactory} from "#~src/public/getDependenciesToInstallFactory.mts"
import {initializeFactory} from "#~src/public/initializeFactory.mts"
import {preprocessFactory} from "#~src/public/preprocessFactory.mts"
import {lintFactory} from "#~src/public/lintFactory.mts"
import {compileFactory} from "#~src/public/compileFactory.mts"
import {generateProductFactory} from "#~src/public/generateProductFactory.mts"
import {getBoilerplateFilesFactory} from "#~src/public/getBoilerplateFilesFactory.mts"
import {getGitIgnoredFilesFactory} from "#~src/public/getGitIgnoredFilesFactory.mts"
import {projectSourceFileFilterFactory} from "#~src/public/projectSourceFileFilterFactory.mts"
import {testProductFactory} from "#~src/public/testProductFactory.mts"
import {publishProductFactory} from "#~src/public/publishProductFactory.mts"

import {preInitializeFactory} from "#~src/public/hook/preInitializeFactory.mts"
import {preLintFactory} from "#~src/public/hook/preLintFactory.mts"
import {preCompileFactory} from "#~src/public/hook/preCompileFactory.mts"

export function generateAPI(apiContext: APIContext): API {
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
