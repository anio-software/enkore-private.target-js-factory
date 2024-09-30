export default function(runtime) {
	return JSON.parse(JSON.stringify(
		runtime.init_data.package_json
	))
}
