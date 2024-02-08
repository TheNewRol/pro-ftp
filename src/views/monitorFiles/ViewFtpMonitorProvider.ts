//https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/src/extension.ts
import * as fs from 'fs';
import * as patch from 'path';
import * as vscode from 'vscode';
import * as React from 'react';

import { Config } from '../../Config';
import { FtpManager } from '../../services/FtpManager';

import { getWorkspaceRootPath } from '../../utils/helper';

export class ViewFtpMonitorProvider implements vscode.WebviewViewProvider {
	
	public static readonly viewType = 'pro-ftp.monitor-file';
	private config: Config;
	private _view?: vscode.WebviewView;
	private ftp:FtpManager; 
	private cachedLines:string[] = [];
	private intervalId:NodeJS.Timeout|undefined;
	constructor(private readonly _extensionUri: vscode.Uri, config: Config) {
		this.config = config;
		this.ftp = new FtpManager();
	}

	public resolveWebviewView( webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken,){
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this.getWebViewContent(webviewView.webview);
		webviewView.webview.onDidReceiveMessage( data => {
			switch (data.action) {
				case 'startMonitorFile':
					this.startMonitor(data.server, data.file);
					break;
				case 'stopMonitorFile':
					this.stopMonitor();
					break;
			}
		});
	}
	public async startMonitor(nameServer: string, patchFile: string){
		let ftpData = this.config.getHostBy("name", nameServer);	
		
		if(!ftpData){
			return;
		}
		
		try{
			const workspacePatch = getWorkspaceRootPath();
			let fileName = patch.basename(patchFile);
			let localPatch = workspacePatch + "/.vscode" + "/" + fileName;

			if(!workspacePatch || !localPatch){
				throw new Error("No hay un espacio de trabajo definido o no se puede construir la ruta local")
			}
			await this.ftp.connect(ftpData);
					
					
			this.intervalId = setInterval(async () => {
				let remoteFileStatus = await this.ftp.fileStatus(patchFile);
				let localFileStatus = this.ftp.localFileStatus(localPatch);

				if(	remoteFileStatus && localFileStatus && 	remoteFileStatus.mtime !== undefined && localFileStatus.mtime !== undefined && 	remoteFileStatus.mtime > localFileStatus.mtime){
					await this.ftp.get(patchFile, localPatch);	
				}
				
				const listLines = this.tailFile(localPatch);

				if (!this._view) {
					throw new Error("La vista no esta definida");
				}

				this._view.webview.postMessage({
					command: 'updateFileContents',
					contents: listLines
				});
			}, 5000);
				
		} catch (error){
			const errorMessage = error instanceof Error ? `Error en el Monitor: ${error.message}` : "ERROR DURANTE LA DESCARGA O CONEXION FTP";	
			vscode.window.showErrorMessage(errorMessage);	
		}
	}
	
	public stopMonitor(){
		this.cachedLines = [];
		clearInterval(this.intervalId);
	}
	private tailFile = (filePath: string, numLines: number = 50): string => {
		// Obtener las últimas n líneas del archivo
		const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
		const start = Math.max(lines.length - numLines, 0);
		const resultLines = lines.slice(start);
		const regexTrace = /\r\n|\r|\n|(\\+)n|;/g; // saltos de línea;
		const regexLog = /(?<info>(\[(?<time>.*?)\]\s\[(?:(?<module>.*?):)?(?<level>.*?)\]\s\[(pid\s(?<pid>\d+)(?::tid\s(?<tid>\d+))?)\]\s\[client\s(?<cliente>.*?)\]))\s(?<message>.*'.*')(?:,\s(?<referer>referer:\s)(?<url>(.*)))/;
		let text = "";

		// Analizar las líneas y agregar los colores correspondientes
		resultLines.map((inputLine: string) => {
    		/** levels https://sematext.com/blog/logging-levels/#the-history-of-log-levels*/
			const regexResult = regexLog.exec(inputLine);
			if (regexResult !== null && regexResult.groups && !this.cachedLines.includes(inputLine)) {
				this.cachedLines.push(inputLine);
				const dataLine = `<div class="messageLine">`+
					`<div class="info">`+
						`<span>${regexResult.groups["info"]}</span>
					</div>
					<div class="message ${regexResult.groups["level"]}">
						<span>${regexResult.groups["message"].replace(regexTrace, '</br>')}</span>
					</div>
					${regexResult.groups["referer"] ? `<div class="referer">${regexResult.groups["referer"]}<a href="${regexResult.groups["url"]}">${regexResult.groups["url"]}</a></div>`: ""}
				</div>`;

        		text += dataLine;
			}
		});

		return text;
	};
	
	private changeHost(event: React.ChangeEvent<HTMLSelectElement>):void {
	}

	private getWebViewContent(webview: vscode.Webview): string{
		const listHosts = this.config.getListHosts();
		const listFiles = this.config.getListFilesMonitor();
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets/js/views', 'ftpMonitor.js'));
		const stylesheet = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets/css/views', 'ftpMonitor.css'));

		if( listHosts === undefined ){
			return 'Host no definido';
		}
		if( listFiles === undefined ){
			return 'Lista de archivos no definida';
		}
		const optionsFiles = listFiles.map( file => `<option value="${file}">${file}</option>`).join("");
		const optionsHosts = listHosts.map( host => `<option value="${host.name}">${host.name}</option>`).join('');
		return `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="UTF-8">
					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src vscode-resource: 'unsafe-inline'; style-src vscode-resource: 'unsafe-inline';">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link rel="stylesheet" href="${stylesheet}">
				</head>
				<body class="viewFtpMonitor">
					<div class="containerFilter">

						<select id="selectHost" onChange={e => this.changeHost(e) } value={ this.state.selectValue }>
							${optionsHosts}
						</select>

						<select id="selectFile">
							${optionsFiles}
						</select>

						<div class="actions">
							<button id="start_monitor" data-status="start">Start Monitor</button>
							<button id="clear_out">Clean Output</button> 
						</div>

					</div>
					<div id="log"></div>
					<script src="${scriptUri}"></script>
				</body>
			</html>
		`;
	}
}