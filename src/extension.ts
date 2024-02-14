// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Config } from './Config';
import { ViewFtpMonitorProvider } from './views/monitorFiles/ViewFtpMonitorProvider';

let config = Config.getInstance();
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    //Monitoreo de archivos
    const viewMonitor = new ViewFtpMonitorProvider( context.extensionUri, config );
    let monitorFile = vscode.window.registerWebviewViewProvider( ViewFtpMonitorProvider.viewType, viewMonitor );

    context.subscriptions.push(monitorFile);

    //COMANDAS MONITOR
    vscode.commands.registerCommand("pro-ftp.monitor-file-stop", () => {
        viewMonitor.stopMonitor();
    });
    vscode.commands.registerCommand("pro-ftp.monitor-file-start", () => {
        viewMonitor.postMessageStart();
    });
    vscode.commands.registerCommand("pro-ftp.monitor-file-clean", () => {
        viewMonitor.cleanOutPut();
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
