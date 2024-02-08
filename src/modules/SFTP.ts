import * as fs from 'fs';
import * as path from 'path';
import * as SftpClient from 'ssh2-sftp-client';

import { FileStatus, FtpConection, ModelFtpConection } from "../interfaces/ModelsFtp";
import { Writable } from 'stream';

export class SFTP implements FtpConection {
    private connection:SftpClient;
    constructor(){
        this.connection = new SftpClient();
    }

    connect(config: ModelFtpConection): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject("error al crear la conexion SFTP");
            }

            this.connection.connect(config)
                .then(() => {
                  resolve("Conexion SFTP establecida");
                })
                .catch((error:Error) => {
                  reject(`Error en la conexion SFTP: ${error.message}`);
                });
        });
    }
    
    end(): string {
        return "";
    }

    public fileStatus(filePatch: string): Promise<FileStatus> {
        return new Promise((resolve, reject) => {
            this.connection.stat(filePatch)
                .then( (value:SftpClient.FileStats) => {
                        resolve({
                        "exists":true,
                        "size": value.size,
                        "mtime": new Date(value.modifyTime)
                      });
                })
            .catch((error:any) => {
                reject(new Error("No se ha podido obtener el estado del archivo"));
            });
        });
    }

    public async get(remotePatch: string, localPatch: string): Promise<void> {
        try {
            const sftpStream = await this.connection?.get(remotePatch);
            
            if(!sftpStream){
                throw new Error("No se pudo obtener el Stream SFTP");
            }

            // Verifica si la carpeta local existe, si no, la crea
            const localFolder = path.dirname(localPatch);
            fs.mkdirSync(localFolder, { recursive: true });

            if (typeof sftpStream === 'string') {
                throw new Error(`Error en la descarga: ${sftpStream}`);
            }
            
            // Si es un Buffer o WritableStream, lo escribe en el archivo local
            if (sftpStream instanceof Buffer) {
                fs.writeFileSync(localPatch, sftpStream);
            } else if (sftpStream instanceof Writable) {
                await new Promise<void>((resolve, reject) => {
                    sftpStream.on('finish', () => {
                        resolve();
                    });
                    sftpStream.on('error', (error) => {
                        console.error('Error al escribir en el archivo local:', error.message);
                        reject(error);
                    });
                    sftpStream.pipe(fs.createWriteStream(localPatch));
                });
            }else{
                throw new Error("Tipo de Stream no reconocido");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? `Error en la descarga: ${error.message}` : "Error desconocido";
            throw new Error(errorMessage);
        }
    }

}