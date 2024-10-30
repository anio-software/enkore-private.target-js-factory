import path from "node:path"
import fs from "node:fs/promises"

export default async function(fourtune_session, file_path, source_file_path) {
	const source_code = (await fs.readFile(
		path.join(fourtune_session.getProjectRoot(), "dist", source_file_path)
	)).toString()

	let code = `const source_code = JSON.parse(${JSON.stringify(JSON.stringify(source_code.toString()))});\n\n`
	code += `export default source_code;\n`

	return code
}
