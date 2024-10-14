export default async function(fourtune_session) {
	//
	// for every .mts create two files: .mjs and .d.mts
	//
	for (const {relative_path} of fourtune_session.getProjectSourceFiles()) {
		console.log(relative_path)

		if (relative_path.endsWith(".d.mts")) {
			fourtune_session.objects.add(
				relative_path, {
					generator: async () => {
						return ""
					},
					generator_args: []
				}
			)
		} else if (relative_path.endsWith(".mts")) {
			const bare_name = relative_path.slice(0, -4)

			fourtune_session.objects.add(
				`${bare_name}.mjs`, {
					generator: async () => {
						return ""
					},
					generator_args: []
				}
			)

			fourtune_session.objects.add(
				`${bare_name}.d.mts`, {
					generator: async () => {
						return ""
					},
					generator_args: []
				}
			)
		}
	}
}
