export default class Templater {
    private static hashes;
    private static templateFolder;
    static setTemplateFolder(name: string): void;
    /**
     * This function will attempt to load the template, read it and then check if it was compiled previously by has comparison.
     * Otherwise it will compile and cache the template
     * @param templateName
     * @param data
     * @returns
     */
    static render(templateName: string, data: Dictionary<any>): Promise<any>;
    /**
     * This function will check for expressions matching {{.*?}} regex which can hold expressions
     *  and isolate them and the surrounding strings into a string array
     * @param templateString
     * @returns
     */
    private static parse;
    /**
     * The string array from the parsed function will be concat in a way that allows interpolation where the parse function matched
     * A function will be created from this that takes in a data argument with which data can be passed to the template
     * @param parsed
     * @returns
     */
    private static compile;
    /**
     * A very simple but fast hash function returning a 32 bit integer
     * @param str
     * @returns
     */
    static hash(str: string): number;
    static escapeForHtml(input: string): string;
}
interface Dictionary<T> {
    [Key: string]: T;
}
export {};
