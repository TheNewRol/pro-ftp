import * as fs from 'fs';
import { window } from 'vscode';

import { FileStatus, ModelFtpConection } from '../interfaces/ModelsFtp';

import { FTP } from '../modules/FTP';
import { SFTP } from '../modules/SFTP';

export class FtpManager {
	
	public conection: FTP | SFTP | undefined = undefined;

	public async connect (ftpConfig: ModelFtpConection): Promise<void> {
		try{

			this.conection = ftpConfig.protocol === 'sftp' ? new SFTP() : new FTP();
			const message = await this.conection.connect(ftpConfig);
			window.setStatusBarMessage( message );

		} catch (error){
			const errorMessage = error instanceof Error ? error.message : "Error desconocido";
			window.showErrorMessage(errorMessage);
		}
	}
	
	async fileStatus(file:string){
		try{
			return await this.conection?.fileStatus(file);
		}catch(error){
			const errorMessage = error instanceof Error ? error.message : "Error desconocido de fileStatus";
			window.showErrorMessage(errorMessage);
		}
	}
	
	public localFileStatus( filePatch: string): FileStatus {
		try{
			const stats = fs.statSync(filePatch);
			return {
				"exists": true,
				"size": stats.size,
				"mtime": stats.mtime
			};
		} catch (error){
			return {
				"exists": false
			};
		}
	}
	public async get(remotePatch:string, localPatch:string):Promise<any>{
		try{
			return await this.conection?.get(remotePatch, localPatch);
		}catch(error){
            const errorMessage = error instanceof Error ? `Error en la descarga: ${error.message}` : "Error desconocido";
			window.showErrorMessage(errorMessage);
		}

	}
}