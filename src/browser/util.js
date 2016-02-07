import fs from 'fs';
import path from 'path';

export function loadUserData() {
  return createIfAbsentDir(app.getPath('userData'), 0o755);
  // TODO implement
}

function createIfAbsentDir(path, mode = null) {
  return dirExists(path).catch(()=>mkdir(path, mode));
}

function readdir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if(err) return reject(err);
      resolve(files);
    });
  });
}

function writeFile(path, content, opt = {}) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, opt, (err)=>{
      if(err) return reject(err);
      resolve();
    });
  });
}

function mkdir(path, mode = null) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, mode, err => {
      if(err) return reject(err);
      resolve(path);
    })
  });
}

function fileExists(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if(err) return reject(err);
      if(stats.isDirectory) return reject('isDirectory');
      resolve(path);
    });
  });
}

function dirExists(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if(err) return reject(err);
      if(stats.isFile) return reject('isFile');
      resolve(path);
    });
  });
}
