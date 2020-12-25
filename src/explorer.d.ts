declare const dir: FileSystem.DirectoryEntry;
declare const instantPath: string;
declare let _initialEntries: Promise<FileSystem.Entry[]>;
declare function goToInstantPath(entriesPromise: PromiseLike<FileSystem.Entry[]>, segments: string[]): Promise<void>;
declare const filecontainer: HTMLElement;
declare class Style {
    private static explorer;
    private static save;
    static load(): void;
    private static set;
    private static get;
    private static toggle;
    static tree: string;
}
interface Modal {
    id: string;
    container: HTMLDivElement;
    content: HTMLDivElement;
}
declare function modal(element?: HTMLElement | ((modal: Modal, closeModal: () => void) => HTMLElement)): {
    content: HTMLDivElement;
    container: HTMLDivElement;
    id: string;
};
declare function modalIntegratedCode(fileEntry: FileSystem.FileEntry, lang: string): void;
declare function modalPreviewMedia(fileEntry: FileSystem.FileEntry): void;
