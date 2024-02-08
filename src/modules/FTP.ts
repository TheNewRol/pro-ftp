import * as fs from 'fs';
import * as path from 'path';
import * as FtpClient from 'ftp';
import { FileStatus, FtpConection, ModelFtpConection } from "../interfaces/ModelsFtp";

export class FTP implements FtpConection{
    private connection: FtpClient;
    constructor(){
        this.connection = new FtpClient();
    }
    connect(config: ModelFtpConection): Promise<string> {
        return new Promise((resolve, reject) => {
		  if (!this.connection) {
			reject('Error creando conexión FTP');
			return;
		  }

		  this.connection.on('ready', () => {
			resolve('Conexión FTP establecida');
		  });

		  this.connection.on('error', (error:Error) => {
			reject(`Error en la conexión FTP: ${error.message}`);
		  });

		  this.connection.connect(config);
		});
    }
    
    end(): string {
        return "";
    }
    
    public fileStatus(filePath: string): Promise<FileStatus> {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject('No hay conexión activa');
                return;
            }

            this.connection.size(filePath, (err, size) => {
                if (err) {
                    reject(err);
                } else {
                    // La función size retorna el tamaño del archivo (stats)
                    resolve({
                        "exists":true,
                        size,
                        "mtime": new Date()
                    });
                }
            });
        });
    }
    
    public get(remotePatch: string, localPatch: string): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        this.connection?.get(remotePatch, (err, stream) => {
          if (err) {
            reject(err);
            return;
          }

          // Verifica si la carpeta local existe, si no, la crea
          const localFolder = path.dirname(localPatch);
          if (!fs.existsSync(localFolder)) {
            fs.mkdirSync(localFolder, { recursive: true });
          }

          const writeStream = fs.createWriteStream(localPatch);

          // Manejar eventos de stream si es necesario
          // stream.on('event', () => {});

          // Pipe para escribir el contenido del archivo en el sistema local
          stream.pipe(writeStream);

          writeStream.on('finish', () => {
            resolve();
          });

          writeStream.on('error', (error) => {
            console.error('Error al escribir en el archivo local:', error.message);
            reject(error);
          });
        });
      });
    }

}