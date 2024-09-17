export default {
	"rollup": {
		version: "4.21.3",
		import_code: `import {rollup} from "rollup"\nexport default rollup`
	},
	"@rollup/plugin-node-resolve": {
		version: "15.2.3",
		import_code: `import nodeResolve from "@rollup/plugin-node-resolve"\nexport default nodeResolve`
	},
	"rollup-plugin-dts": {
		version: "6.1.1",
		import_code: `import {dts} from "rollup-plugin-dts"\nexport default dts`
	}
}
