//@ts-ignore
(function () {
    const vscode = acquireVsCodeApi();
	document.querySelector('#start_monitor').addEventListener('click', () => {
		let serverName = document.getElementById('selectHost').value;
		let selectFile = document.getElementById('selectFile').value;
		
		let buttonMonitor = document.querySelector('#start_monitor');
		let statusButton = buttonMonitor.getAttribute('data-status');

		if(statusButton === "start"){
			buttonMonitor.innerText = "Stop Monitor";
			buttonMonitor.setAttribute("data-status", "stop");

			vscode.postMessage({ 
				action: 'startMonitorFile',
				server: serverName,
				file: selectFile
			});
		}else{
			buttonMonitor.innerText = "Start Monitor";
			buttonMonitor.setAttribute("data-status", "start");
			vscode.postMessage({ 
				action: 'stopMonitorFile',
				server: serverName,
				file: selectFile
			});
		}
	});
	document.querySelector('#clear_out').addEventListener('click', () => {
		document.getElementById('log').innerHTML  = "";
	});	
	window.addEventListener('message', event => {
		const message = event.data;

		switch (message.command) {
		  case 'updateFileContents':
			// Actualizar la vista en el Webview con el contenido del archivo
			document.getElementById('log').innerHTML += message.contents;
			break;
		}
	});	
}());