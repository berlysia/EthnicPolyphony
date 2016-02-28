import * as fs from 'fs';
import * as path from 'path';

function validate(basepath: string, given: string) {
    return given.startsWith(basepath);
}

export default class JSONLoader {
    private static basepath = path.resolve(__dirname, '..', 'resources');
    static read(name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const jsonpath = path.resolve(this.basepath, name);
            if (!validate(this.basepath, jsonpath)) {
                return reject(`invalid path: ${jsonpath}`);
            }
            fs.exists(jsonpath, result => {
                if (!result) {
                    return reject(`file not found: ${jsonpath}`);
                }
                fs.readFile(jsonpath, 'utf-8', (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(JSON.parse(data));
                });
            });
        });
    }

    static readSync(name: string) {
        const jsonpath = path.resolve(this.basepath, name);
        if (!validate(this.basepath, jsonpath)) {
            return null;
        }

        if (!fs.existsSync(jsonpath)) {
            return null;
        }

        try {
            return JSON.parse(fs.readFileSync(jsonpath, 'utf-8'));
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    static write(name: string, data: any): Promise<{}> {
        return new Promise((resolve, reject) => {
            const jsonpath = path.resolve(this.basepath, name);
            if (!validate(this.basepath, jsonpath)) {
                return reject(`invalid path: ${jsonpath}`);
            }
            fs.writeFile(jsonpath, JSON.stringify(data, null, '  '), err => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
