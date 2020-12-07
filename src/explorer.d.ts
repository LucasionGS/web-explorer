declare const dir: FileSystem.DirectoryEntry;
declare const instantPath: string;
declare let _initialEntries: Promise<FileSystem.Entry[]>;
declare function goToInstantPath(entriesPromise: Promise<FileSystem.Entry[]>, segments: string[]): Promise<void>;
