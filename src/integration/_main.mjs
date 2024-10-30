import {loadRealmDependencies} from "fourtune/base-realm"
import path from "node:path"

export function provideBundledSource(
	options
) {
	const {name} = options

	return [{
		name: `${name}.mjs`,
		async generator(fourtune_session) {
			const project_root = fourtune_session.getProjectRoot()

			const {getDependency} = await loadRealmDependencies(
				project_root, "realm-js"
			)

			const {tsBundler} = getDependency("@fourtune/base-realm-js-and-web")

			const input = path.join(project_root, options.input)

			return `export default ${JSON.stringify(
				await tsBundler(
					project_root,
					`export * from ${JSON.stringify(input)}\n` +
					`export {default} from ${JSON.stringify(input)}`,
					{
						treeshake: false
					}
				)
			)}`
		}
	}, {
		name: `${name}.d.mts`,
		generator() {
			return `declare const _default : string\nexport default _default`
		}
	}]
}
