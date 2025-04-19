import type {EnkoreSessionAPI} from "@enkore/spec"
import {getTargetDependency} from "./getTargetDependency.mts"

export function getGlobalRuntimeDataInitCode(
	session: EnkoreSessionAPI,
	map: Record<string, unknown>
): string {
	let code = ``

	code += `
globalThis.__initEnkoreJSRuntimeGlobalProjectEmbedMap = function(embedMap) {
	let newEmbedMap = Object.create(null);

	for (const embedPath in embedMap) {
		const embedData = globalThis.structuredClone(embedMap[embedPath]);

		newEmbedMap[embedPath] = embedData;

		Object.freeze(embedData);
	}

	Object.freeze(newEmbedMap);

	return newEmbedMap;
};
`

	code += `\nObject.defineProperty(globalThis, Symbol.for(`
	code += `"@enkore/target-js/globalEmbedsMap"`
	code += `), {writable: false, configurable: false, value:`
	code += `globalThis.__initEnkoreJSRuntimeGlobalProjectEmbedMap(JSON.parse(`
	code += JSON.stringify(JSON.stringify(map))
	code += `))});\n`

	return code
}
