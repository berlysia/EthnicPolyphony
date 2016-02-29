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

- when new Tweet added to timeline
- Tweets are scrambled (depend on timing to invoke 'connect' and 'reload')
- Tweets flow down when Tweet prepended  
- memory leak because Tweet cache is unlimited
- break `resources/view.json` file sometimes


## future works

### high priority

- show images
- favorite
- put anchors
- attach some styles


### low priority

- attach some **good** styles
- add more types of view(user, list, search, etc...)
- virtual scroll

## structure

![structure](https://raw.githubusercontent.com/berlysia/EthnicPolyphony/master/image.png)

## License

MIT

