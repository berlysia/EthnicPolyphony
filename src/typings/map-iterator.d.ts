declare module mapIterator {
    interface mapIterator {
        <T, U>(iterable: IterableIterator<T>, map: (value: T) => U): U[];
    }
}

declare module "map-iterator" {
    var map: mapIterator.mapIterator;
    export = map;
}
