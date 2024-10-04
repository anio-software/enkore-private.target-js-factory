export default {
	"rollup": {
		version: "4.21.3",
		import_code: `import {rollup} from "rollup"\nexport default rollup`
	},
	//
	// needed to resolve npm dependencies
	//
	"@rollup/plugin-node-resolve": {
		version: "15.2.3"
	},
	//
	// needed for virtual rollup entries
	//
	"@rollup/plugin-virtual": {
		version: "3.0.2"
	},
	//
	// needed to minify code
	//
	"@rollup/plugin-terser": {
		version: "0.4.4"
	},
	//
	// needed to process .d.mts files
	//
	"rollup-plugin-dts": {
		version: "6.1.1",
		import_code: `import {dts} from "rollup-plugin-dts"\nexport default dts`
	},
	//
	// needed to check javascript files
	//
	"typescript": {
		version: "5.6.2",
		import_code: `import * as ts from "typescript"\nexport default ts`
	}
}
