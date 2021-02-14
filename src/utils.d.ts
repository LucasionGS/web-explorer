declare function detectSwipe(element: HTMLElement, callback: (direction: "up" | "down" | "left" | "right", evt: TouchEvent) => void): void;
declare function detectDragDrop(element: HTMLElement, callback: (eventType: "dragstart" | "dragover" | "dragleave" | "dragenter" | "drop", evt: DragEvent) => void): void;
