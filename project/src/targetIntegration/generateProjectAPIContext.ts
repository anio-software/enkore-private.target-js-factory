import {
	type EnkoreSessionAPI,
	type EnkoreJSRuntimeProjectAPIContext,
	createEntity
} from "@anio-software/enkore-private.spec"

export async function generateProjectAPIContext(
	session: EnkoreSessionAPI
): Promise<EnkoreJSRuntimeProjectAPIContext> {
	return createEntity("EnkoreJSRuntimeProjectAPIContext", 0, 0, {
		project: createEntity("EnkoreJSRuntimeProject", 0, 0, {
			enkoreConfiguration: JSON.parse(JSON.stringify(session.project.config)),
			packageJSON: JSON.parse(JSON.stringify(session.project.packageJSON)),
			projectId: ""
		}),

		_projectEmbedFileMapRemoveMeInBundle: new Map()
	})
}
