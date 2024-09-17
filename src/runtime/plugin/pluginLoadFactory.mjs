import buildVirtualModuleCode from "./buildVirtualModuleCode.mjs"

export default function(ctx, use_static_resources) {
	return async function(id) {
		if (!id.startsWith(`\0@4tune/realm-`)) {
			return null
		}

		return await buildVirtualModuleCode(ctx, use_static_resources)
	}
}
