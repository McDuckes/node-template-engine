import * as fs from 'fs/promises';

export default class Templater {

    private static hashes: Dictionary<CachedTemplate> = {};
    private static templateFolder: string = './';

    public static setTemplateFolder(name: string) {
        this.templateFolder = name;
    }

    /**
     * This function will attempt to load the template, read it and then check if it was compiled previously by has comparison.
     * Otherwise it will compile and cache the template
     * @param templateName 
     * @param data 
     * @returns 
     */
    public static async render(templateName: string, data: Dictionary<any>) {
        let templateString = (await fs.readFile(this.templateFolder + templateName)).toString();
        let hash = this.hash(templateString).toString();
        let cached = this.hashes[templateName];

        if (cached === undefined || cached.hash !== hash) {
            let chunks = this.parse(templateString);
            let fn = this.compile(chunks);
            cached = this.hashes[templateName] = new CachedTemplate(hash, fn);
        }
        return cached.fn(data);
    }

    /**
     * This function will check for expressions matching {{.*?}} regex which can hold expressions
     *  and isolate them and the surrounding strings into a string array
     * @param templateString 
     * @returns 
     */
    private static parse(templateString: string) {
        const chunks = [];

        while (true) {
            //Expand here with your custom tags
            let result = /{{(.*?)}}|YOURTAG(.*?)YOURTAG/g.exec(templateString);
            if (!result) break;

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
     * The string array from the parsed function will be concat in a way that allows interpolation where the {{.*?}} matched
     * A function will be created from this that takes in a data argument with which data can be passed to the template
     * @param parsed 
     * @returns 
     */
    private static compile(parsed: string[]) {
        let renderFunction = `""`;

        //Expand here with your custom tags
        parsed.map(t => {
            if (t.startsWith("{{") && t.endsWith("}}")) {
                renderFunction += `+${t.substring(2, t.length - 2)}`;
            } else {
                renderFunction += `+\`${t}\``;
            }
        });

        return new Function('data', "return " + renderFunction);
    }

    /**
     * A very simple but fast hash function returning a 32 bit integer
     * @param str 
     * @returns 
     */
    public static hash(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= hash;
        }
        return hash;
    };
}

class CachedTemplate {
    constructor(
        public readonly hash: string,
        public readonly fn: Function
    ) { }
}

interface Dictionary<T> {
    [Key: string]: T;
}