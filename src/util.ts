import * as fs from 'fs';
import * as path from 'path';
import {app} from "electron";

interface UserData {
    [id: number]: {
        accessToken: string,
        accessTokenSecret: string
    }
}

export function loadUserData(): Promise<any> {
    /*
      *MUST BE CATCHED*
      1. read app.getPath('userData') directory's files
      2. filter by filename
      3. filter by whether file is file(not directory)
      4. parse as JSON
      5. returns object<number(id), object(file content)>
    */
    return createIfAbsentDir(app.getPath('userData'), 0o755)
        .then(() => readdir(app.getPath('userData')))
        .then((files: string[]) =>
            files.filter((file: string) =>
                !!file.match(/^account_\d+\.json$/)
            )
        )
        .then((files: string[]) => {
            return Promise.all(files.map(fileExists))
                .then((conds: boolean[]) => Promise.all(
                    files.filter((file: string, idx: number) => conds[idx])
                ));
        })
        .then((files: string[]) => {
            const ret: any = {};
            return Promise.all(files.map((file: string) => {
                readFile(file)
                    .then((data: string) => {
                        const matched = file.match(/^account_(\d+)\.json$/);
                        const id = matched[1];
                        ret[id] = JSON.parse(data);
                    })
            }))
                .then(() => ret);
        });
}

function createIfAbsentDir(path: string, mode?: number): Promise<{}> {
    return dirExists(path).catch(() => mkdir(path, mode));
}

function readdir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });
}

function readFile(path: string, charset?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, charset, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        })
    });
}

function writeFile(path: string, content: string, opt = {}): Promise<{}> {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, content, opt, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function mkdir(path: string, mode?: number): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, mode, err => {
            if (err) return reject(err);
            resolve(path);
        })
    });
}

function fileExists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) return reject(err);
            resolve(stats.isFile);
        });
    });
}

function dirExists(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) return reject(err);
            resolve(stats.isDirectory);
        });
    });
}
