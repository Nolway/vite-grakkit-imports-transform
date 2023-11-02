import fs from "fs";

const javaPrefixes = ["java.", "com.", "co.", "org.", "net.", "me.", "io."];

function transformFile(filePath: string, code: string, extraPrefixes: string[]) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filePath} does not exist`);
    }

    let result = code;

    for (const prefix of javaPrefixes.concat(extraPrefixes)) {
        result = result.replace(new RegExp(`import\\s{(.*)}\\sfrom\\s[",'](${prefix}.*)[",']`, "gm"), (substring, varNames, path) => {
            let res = "";

            if (typeof varNames !== "string") {
                throw new Error("varNames is not a string");
            }

            if (typeof path !== "string") {
                throw new Error("path is not a string");
            }

            const vars = varNames.split(",").map((v) => v.trim());

            for (const varName of vars) {
                res += `const ${varName} = Java.type("${path + "." + varName}")\n`;
            }

            return res;
        });
    }

    return result;
}

export default (extraPrefixes: string[]) => {
    return {
        name: "grakkit-imports-transform",
        transform(code: string, pathId: string) {
            if (
                !pathId.includes("node_modules/") &&
                !pathId.includes("commonjsHelpers.js") &&
                ["js", "ts"].some((suffix) => new RegExp(`[^/]+${suffix}$`).test(pathId))
            ) {
                return transformFile(pathId, code, extraPrefixes);
            }
        },
    };
};
