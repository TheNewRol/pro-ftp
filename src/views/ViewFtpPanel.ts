import * as vscode from 'vscode';

export class ViewFtpPanel {

	private static panel: vscode.WebviewPanel | undefined;

	public static createOrShow(context: vscode.ExtensionContext) {
		if(ViewFtpPanel.panel) {
			ViewFtpPanel.panel.reveal(vscode.ViewColumn.One);
		} else {
			ViewFtpPanel.panel = vscode.window.createWebviewPanel(
				'ftpPanel',
				'FTP Connections',
				vscode.ViewColumn.One,
				{
					enableScripts: true
				}
			);

			ViewFtpPanel.panel.webview.html = ViewFtpPanel.getWebViewContent();
		}
	}

	private static getWebViewContent(): string{
		//const connectionList = 
		return `
			<!DOCTYPE html>
			<html>
				<head>
					<style>
						body {
							font-family: 'Segon UI, Tahoma, Geneva, Verdana, sans-serif;
						}
					</style>
				</head>
				<body>
					<h1>FTP Connections</h1>
					<select id="selectConnection">
						<option value="primera conexion">Primera Conexión</option>
					</select>
					
					<script>
						console.log("script from panel view");
					</script>
				</body>
			</html>
		`;
	}
}