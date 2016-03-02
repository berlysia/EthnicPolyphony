Ethnic Polyphony
====

Twitter Client built with Electron & React & TypeScript. WIP.

## installation

put your app credentials into `resources/credentials.json`.

```
$ npm install -g typescript typings  # if absent (preferred 1.8 >=)
$ npm install
$ typings install
$ npm run build
$ npm start
```

## configs / settings

everything are in `resources`


## known issue

- [x] Tweets are scrambled (depend on timing to invoke 'connect' and 'reload')
- [ ] Tweets flow down when Tweet prepended  
- [x] memory leak because Tweet cache is unlimited
- [ ] break `resources/view.json` file sometimes
- [x] cannot edit tweet when renderer hardly works
  - Now receiving Tweet from user stream is queued and flush every 5 seconds

## tasks

### high priority

- [x][x] show (icon) images (+ user media)
- [ ] favorite
- [ ] put anchors
- [x] attach some styles
- [ ] ~~omit React(performance problem)~~

### low priority

- [ ] attach some **good** styles
- [ ] add more types of view(user, list, search, etc...)
- [ ] ~~virtual scroll~~

## structure

![structure](https://raw.githubusercontent.com/berlysia/EthnicPolyphony/master/image.png)

## License

MIT

