import * as FtpClient from 'ftp';
import * as SftpClient from "ssh2-sftp-client";

export interface ModelConfigFtpHost {
	name: string,
	host: string,
	user: string,
	password: string,
	protocol: string
	monitor?:{
		files?:[],
		lines: number
	}
}

export interface ModelFtpConection extends ModelConfigFtpHost {
	port: number,
	secure: boolean,
	localDir: string,
	remoteDir: string
}
export interface FileStatus {
	exists: boolean,
	size?: number; // Tamaño del archivo en bytes
	mtime?: Date; // Fecha de modificación del archivo
  // Otros campos que puedan ser comunes a FTP y SFTP
}
export interface FtpConection {
	connect(config:ModelFtpConection): Promise<string>;
	end(): string;
	fileStatus(filePatch:string): Promise<FileStatus>;
}