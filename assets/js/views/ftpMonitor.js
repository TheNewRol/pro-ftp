//@ts-ignore
(function () {
    const vscode = acquireVsCodeApi();

	window.addEventListener('message', event => {
		const message = event.data;

		switch (message.command) {
			case 'updateFileContents':
				// Actualizar la vista en el Webview con el contenido del archivo
				document.getElementById('log').innerHTML += message.contents;
				break;
			case 'clearOutPut':
				document.getElementById('log').innerHTML  = "";
				break;
			case 'start':
				let serverName = document.getElementById('selectHost').value;
				let selectFile = document.getElementById('selectFile').value;	
				vscode.postMessage({ 
					action: 'startMonitorFile',
					server: serverName,
					file: selectFile
				});
				break;
		}
	});	
}());