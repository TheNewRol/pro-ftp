import * as vscode from 'vscode';

export function getWorkspaceRootPath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders && workspaceFolders.length > 0) {
        // Obtén la primera carpeta del espacio de trabajo (puede haber múltiples carpetas en un proyecto)
        const rootPath = workspaceFolders[0].uri.fsPath;
        return rootPath;
    }

    // Devuelve undefined si no hay carpetas en el espacio de trabajo
    return undefined;
}
