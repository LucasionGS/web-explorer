declare namespace FileSystem {
    var currentDirectory: DirectoryEntry;
    interface EntryElement extends HTMLDivElement {
        entry: Entry;
    }
    interface TreeEntryElement extends HTMLDivElement {
        entry: Entry;
    }
    interface Openable {
        open(): void;
    }
    enum FileType {
        Directory = 0,
        File = 1
    }
    function readDirectory(path: string): Promise<Entry[]>;
    class Entry {
        path: string;
        type: FileType;
        static deselectAll(): void;
        parent: DirectoryEntry;
        constructor(path: string, type: FileType);
        getName(): string;
        setDetails(): void;
        isFile(): this is FileEntry;
        isDirectory(): this is DirectoryEntry;
        selected: boolean;
        static getCurrentEntries(): Entry[];
        static getSelectedEntries(): Entry[];
        static bulkDelete(bulk: Entry[]): Promise<void>;
        rename(newName?: string, skipReload?: boolean): Promise<{
            success: boolean;
            reason?: string;
        }>;
        delete(skipReload?: boolean): Promise<void | {
            success: boolean;
            reason?: string;
        }>;
        element: EntryElement;
        treeElement: TreeEntryElement;
        physicalPath: string;
        icon: string;
    }
    class DirectoryEntry extends Entry implements Openable {
        constructor(path: string);
        entries: Entry[];
        newFolder(name?: string): Promise<void>;
        uploadFile(files: File[], message?: string): Promise<{
            success: boolean;
            reason?: string;
        }>;
        updateElement(): void;
        open(): Promise<Entry[]>;
    }
    class FileEntry extends Entry implements Openable {
        constructor(path: string);
        open(): Promise<void>;
        size: number;
        static parseSize(size: number): string;
        parseSize(): string;
        getExt(): string;
        isImage(): boolean;
        isVideo(): boolean;
        isAudio(): boolean;
        openInEditor(): void;
        updateElement(): void;
    }
    function loadingSpinner(): HTMLDivElement;
    function traverseDirectory(entry: any): Promise<{}>;
    function fileListToArray(fileList: FileList): File[];
}
