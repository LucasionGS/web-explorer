declare const dir: FileSystem.DirectoryEntry;
declare const instantPath: string;
declare let _initialEntries: Promise<FileSystem.Entry[]>;
declare function goToInstantPath(entriesPromise: Promise<FileSystem.Entry[]>, segments: string[]): Promise<void>;
declare class Style {
    private static explorer;
    private static save;
    static load(): void;
    private static set;
    private static get;
    private static toggle;
    static tree: string;
}
