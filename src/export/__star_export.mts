export const apiID = "EnkoreRealmIntegrationAPI"
export const apiMajorVersion = 0
export const apiRevision = 0

export {getInitialInternalData} from "#~src/public/getInitialInternalData.mts"
export {getRealmDependenciesToInstall} from "#~src/public/getRealmDependenciesToInstall.mts"
export {initialize} from "#~src/public/initialize.mts"
export {preprocess} from "#~src/public/preprocess.mts"
export {lint} from "#~src/public/lint.mts"
export {compile} from "#~src/public/compile.mts"
export {generateProduct} from "#~src/public/generateProduct.mts"
export {getBoilerplateFiles} from "#~src/public/getBoilerplateFiles.mts"
export {getGitIgnoredFiles} from "#~src/public/getGitIgnoredFiles.mts"
export {projectSourceFileFilter} from "#~src/public/projectSourceFileFilter.mts"
export {testProduct} from "#~src/public/testProduct.mts"
export {publishProduct} from "#~src/public/publishProduct.mts"

import {preInitialize} from "#~src/public/hook/preInitialize.mts"
import {preLint} from "#~src/public/hook/preLint.mts"
import {preCompile} from "#~src/public/hook/preCompile.mts"

export const hook = {
	preInitialize, preLint, preCompile
}
