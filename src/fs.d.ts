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
    function request<JSONResponse extends {
        [key: string]: any;
    } = any>(path: string, data?: {
        [key: string]: string | string[] | Blob;
    }, method?: "GET" | "POST" | "FORM-GET" | "FORM-POST"): Promise<JSONResponse>;
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
        move(newPath?: string, skipReload?: boolean): Promise<{
            success: boolean;
            reason?: string;
        }>;
        delete(skipReload?: boolean, forceFolders?: boolean): Promise<{
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
        uploadFile(files: File[], message?: string | ((percentTotal: number, loaded: number, total: number) => string)): Promise<{
            success: boolean;
            reason?: string;
        }>;
        updateElement(): void;
        /**
         * Returns all entries of this folder.
         */
        read(): Promise<Entry[]>;
        open(): Promise<Entry[]>;
        open(stayInFolder: boolean): Promise<Entry[]>;
    }
    class FileEntry extends Entry implements Openable {
        constructor(path: string);
        /**
         * Get view URL
         */
        view(): string;
        open(): Promise<void>;
        size: number;
        previewImage: string;
        static parseSize(size: number): string;
        parseSize(): string;
        setIconToPreview(): void;
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
    function zip(entries: Entry[]): Promise<any>;
}
