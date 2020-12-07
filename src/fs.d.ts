declare namespace FileSystem {
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
        constructor(path: string, type: FileType);
        isFile(): this is FileEntry;
        isDirectory(): this is DirectoryEntry;
        rename(): void;
        delete(): void;
        element: EntryElement;
        treeElement: TreeEntryElement;
        physicalPath: string;
        icon: string;
    }
    class DirectoryEntry extends Entry implements Openable {
        constructor(path: string);
        entries: Entry[];
        updateElement(): void;
        open(): Promise<Entry[]>;
    }
    class FileEntry extends Entry implements Openable {
        constructor(path: string);
        open(): Promise<void>;
        updateElement(): void;
    }
}