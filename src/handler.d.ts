declare var ac: any;
declare function fileListToArray(list: FileList): File[];
declare function upload(e: Event): void;
declare function addCustomDir(): void;
declare class Path {
    /**
     * Corrects a path's ``\`` into ``/`` and double slashes will turn into singles. Removes irrelevant ``./``.
     * @param {string} path Path to correct
     */
    static correct(path: string): string;
    static getFile(path: string): string;
}
declare function setLargePreviewImage(path: string, type?: "image" | "video"): void;
declare function setCookie(name: string, value: any, reloadOnResponse?: boolean): void;
declare function folderActionButtonHandler(e: HTMLAnchorElement): void;
interface Modal {
    id: string;
    container: HTMLDivElement;
    content: HTMLDivElement;
}
declare function modal(element?: HTMLElement | ((modal: Modal, closeModal: () => void) => HTMLElement)): void;
declare function renameModal(target: string): void;
