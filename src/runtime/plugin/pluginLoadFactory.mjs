import buildVirtualModuleCode from "./buildVirtualModuleCode.mjs"

export default function(ctx, use_static_resources) {
	return async function(id) {
		if (
			id !== `\0@fourtune/realm-js/api` &&
			id !== `\0@fourtune/realm-web/api`
		) {
			return null
		}

		return await buildVirtualModuleCode(ctx, use_static_resources)
	}
}
