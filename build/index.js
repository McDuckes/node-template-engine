"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs/promises"));
class Templater {
    static setTemplateFolder(name) {
        this.templateFolder = name;
    }
    /**
     * This function will attempt to load the template, read it and then check if it was compiled previously by has comparison.
     * Otherwise it will compile and cache the template
     * @param templateName
     * @param data
     * @param cacheReload time in ms until file hash will be checked again, defaults to 10000 ms
     * @returns
     */
    static async render(templateName, data, cacheReload = 10000) {
        let time = this.times[templateName];
        let cached = this.hashes[templateName];
        if (time && time < Date.now() || !cached) {
            let templateString = (await fs.readFile(this.templateFolder + templateName)).toString();
            let hash = this.hash(templateString).toString();
            if (cached === undefined || cached.hash !== hash) {
                let chunks = this.parse(templateString);
                let fn = this.compile(chunks);
                cached = this.hashes[templateName] = new CachedTemplate(hash, fn);
            }
            this.times[templateName] = Date.now() + cacheReload;
        }
        return cached.fn(data, $include);
    }
    /**
     * This function will check for expressions matching {{.*?}} regex which can hold expressions
     *  and isolate them and the surrounding strings into a string array
     * @param templateString
     * @returns
     */
    static parse(templateString) {
        const chunks = [];
        while (true) {
            //Expand here with your custom tags
            let result = /{{(.*?)}}|{!(.*?)!}/g.exec(templateString);
            if (!result)
                break;
            if (result.index !== 0) {
                chunks.push(templateString.substring(0, result.index));
                templateString = templateString.slice(result.index);
            }
            chunks.push(result[0]);
            templateString = templateString.slice(result[0].length);
        }
        chunks.push(templateString);
        return chunks;
    }
    /**
     * The string array from the parsed function will be concat in a way that allows interpolation where the parse function matched
     * A function will be created from this that takes in a data argument with which data can be passed to the template
     * @param parsed
     * @returns
     */
    static compile(parsed) {
        let renderFunction = `""`;
        //Expand here with your custom tags
        parsed.map(t => {
            if (t.startsWith("{!") && t.endsWith("!}")) {
                renderFunction += `+${t.substring(2, t.length - 2)}`;
            }
            else if (t.startsWith("{{") && t.endsWith("}}")) {
                renderFunction += `+${Templater.escapeForHtml(t.substring(2, t.length - 2))}`;
            }
            else {
                renderFunction += `+\`${t}\``;
            }
        });
        return new Function('data', '$include', "return " + renderFunction);
    }
    /**
     * A very simple but fast hash function returning a 32 bit integer
     * @param str
     * @returns
     */
    static hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash;
        }
        return hash;
    }
    ;
    static escapeForHtml(input) {
        return input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
Templater.hashes = {};
Templater.times = {};
Templater.templateFolder = './';
exports.default = Templater;
class CachedTemplate {
    constructor(hash, fn) {
        this.hash = hash;
        this.fn = fn;
    }
}
function $include(templateName, data) {
    return Templater.render(templateName, data);
}
