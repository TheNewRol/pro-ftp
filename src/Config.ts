//import * as fs from 'fs';
import * as vscode from 'vscode';
import { ModelFtpConection, ModelConfigFtpHost } from './interfaces/ModelsFtp';

export class Config {
    private static instance: Config;
    private extensionConfig: vscode.WorkspaceConfiguration;
    
    private constructor () {
        this.extensionConfig = vscode.workspace.getConfiguration("ProFtp");
    }
    
    public static getInstance(): Config {
        if( !Config.instance ){
            Config.instance = new Config();
        }
        
        return Config.instance;
    }
    /**
     * Obtiene la lista de hosts definido en la configuración.
     * @returns Una lista de objetos ModelConfigFtpHost o undefined si no se ha definido ningún host.
     */
    public getListHosts(): ModelConfigFtpHost[]{
        let listHosts:ModelConfigFtpHost[]|undefined = this.extensionConfig.get('hosts');
        if(listHosts === undefined || listHosts.length === 0){
            vscode.window.showErrorMessage("No se ha definido ningún host para conectarse");
            return [];
        }
        return listHosts;
    }
    public getListFilesMonitor(){
        
        let listFiles:string[]|undefined = this.extensionConfig.get("monitorRemoteFile");
        if(listFiles === undefined){
            vscode.window.showErrorMessage("No se ha definido ninguna ruta de archivo para monitorea");
            return undefined;
        }
        return listFiles;
    }
    public getConfigHost(field: string, value: any):ModelConfigFtpHost|null{
        let listHosts:ModelConfigFtpHost[] = this.getListHosts();
        let host = listHosts.find( (item:ModelConfigFtpHost) => { return item.name === value ?? true; });
        if(host === undefined){
            return null;
        }
        return host;
    }
    /**
     * @param {string} field
     * @param {any} value
     * @return {undefined|ModelFtpConection}
     */
    public getHostBy(field: string, value: any): undefined|ModelFtpConection{
        let listHosts:ModelConfigFtpHost[]|undefined = this.getListHosts();
        let localDir:string|undefined = this.extensionConfig.get('localPatch');
        let remoteDir:string|undefined = this.extensionConfig.get('remotePatch');
        
        if(Array.isArray(listHosts) && listHosts.length > 0){
            let host:any = listHosts.find( (item:ModelConfigFtpHost) => { return item.name === value ?? true; });
            
            if( host !== undefined ){
                // Define port connection
                switch(host.protocol){
                    case 'sftp': host.port = 22; host.secure = true; break;
                    default: host.port = 21; break;                 
                }

                host.remoteDir = remoteDir !== undefined ? remoteDir : "/";
                host.localDir = localDir !== undefined ? localDir : "";
                return host;
            }
        }
        return undefined;
    }
}