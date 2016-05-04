import * as React from 'react';

import ActionCreator, {ViewType, ViewOption} from '../AppContext/ActionCreator';
import {default as UserProfileStoreGroup} from '../ViewContext/StoreGroups/UserProfile';
import {shell} from 'electron';
import {Tweet as TweetModel, Entities, Users} from '../Models/Tweet';

import {getProfileImage} from '../util';

const debug = require('remote').require('debug')('Components:UserProfile');
const classBuilder = require('bemmer').createBuilder('user_profile');

interface Props {
    id: string;
    appActions: ActionCreator;
    store: UserProfileStoreGroup;
};

type State = {
    user: Users;
    type: ViewOption;
};

export default class UserProfile extends React.Component<Props, State> {
    remover: Function;
    removerOnUnload: Function;

    constructor(props: Props, context: any) {
        super(props, context);
        this.state = props.store.getState();
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState(nextProps.store.getState());
    }

    imageSource(user: any) {
        // TODO size reduction, preload image...
        return `${user.profile_banner_url}/1500x500`;
    }

    __openUserTimeline() {
        this.props.appActions.pushStack({
            type: ViewType.UserTimeline,
            source_id: this.state.type.source_id,
            target_id: this.state.user.id_str,
        });
    }
    _openUserTimeline = this.__openUserTimeline.bind(this);

    __reloadProfile() {
        this.props.appActions.fetchProfile(this.state.type.source_id, this.state.user.id_str);
    }
    _reloadProfile = this.__reloadProfile.bind(this);

    __openUrl() {
        shell.openExternal(this.state.user.url);
    }
    _openUrl = this.__openUrl.bind(this);

    __openUserPage() {
        shell.openExternal(`https://twitter.com/${this.state.user.screen_name}`);
    }
    _openUserPage = this.__openUserPage.bind(this);

    render() {
        debug('#render');
        const user = this.state.user;

        if (user) return (
            <section id={this.props.id} className={classBuilder() }>
                <section className={classBuilder('__wrapper') }>
                    <section className={classBuilder('__header') }>
                        <section className={classBuilder('__header__header') }>
                            <img src={getProfileImage(user.profile_image_url, '') }
                                className={classBuilder('__header__avatar') }
                                />
                            <section className={classBuilder('__header__content') }>
                                <p><a onClick={this._openUserPage}>{`@${user.screen_name}`}</a></p>
                                <p>{user.name}</p>
                                <p>{user.location}</p>
                                <p><a onClick={this._openUrl}>{user.url}</a></p>
                            </section>
                        </section>
                        <section className={classBuilder('__header__description') }>
                            {user.description}
                        </section>
                    </section>
                    <section className={classBuilder('__ribbon') }>
                        <div className={classBuilder('__ribbon__item', { statuses: true }) }
                            onClick={this._openUserTimeline}>
                            <span className={classBuilder('__ribbon__item__value') }>
                                {user.statuses_count}
                            </span>
                        </div>
                        <div className={classBuilder('__ribbon__item', { followees: true }) }>
                            <span className={classBuilder('__ribbon__item__value') }>
                                {user.friends_count}
                            </span>
                        </div>
                        <div className={classBuilder('__ribbon__item', { followers: true }) }>
                            <span className={classBuilder('__ribbon__item__value') }>
                                {user.followers_count}
                            </span>
                        </div>
                        <div className={classBuilder('__ribbon__item', { favorites: true }) }>
                            <span className={classBuilder('__ribbon__item__value') }>
                                {user.favourites_count}
                            </span>
                        </div>
                    </section>
                    <button onClick={this._reloadProfile}>reload profile</button>
                </section>
            </section>
        );

        return (
            <section id={this.props.id}>
                <p>loading...</p>
            </section>
        );
    }
}
