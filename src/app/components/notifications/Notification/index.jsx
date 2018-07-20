import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import tt from 'counterpart';
import Userpic from 'app/components/elements/Userpic';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Url from 'app/utils/Url';
import * as type from './type';
import badges from './icon';
import * as notificationActions from 'app/redux/NotificationReducer';

const TIMEOUT_MARK_SHOWN_MILLIS = 3000;

class Notification extends React.Component {
    static propTypes = {
        data: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func,
    };

    componentDidMount() {
        this.cueMarkShown();
    }

    componentWillUnmount() {
        clearTimeout(this.markShownTimeout);
    }

    markReadDefault = e => {
        this.props.markRead(this.props.data.id);
    };

    markRead = e => {
        e.preventDefault();
        e.stopPropagation();
        this.props.markRead(this.props.data.id);
    };

    cueMarkShown = () => {
        const self = this;
        clearTimeout(this.markShownTimeout);
        this.markShownTimeout = setTimeout(() => {
            self.props.markShown(this.props.data.id);
        }, TIMEOUT_MARK_SHOWN_MILLIS);
    };

    markUnread = e => {
        e.preventDefault();
        e.stopPropagation();
        this.props.markUnread(this.props.data.id);
    };

    render() {
        const amount = this.props.data.amount;
        const author = this.props.data.author;
        const classNames = this.props.data.read ? '' : 'unread';
        const created = this.props.data.created;
        const item = this.props.data.item;
        const read = this.props.data.read;
        const post = this.props.data.rootItem;
        const notificationType = this.props.data.notificationType;

        const badge = badges[notificationType]
            ? badges[notificationType]
            : null;
        const localeRoot = `notifications.${notificationType}`;

        let bodyContent = null;
        let headerContent = null;
        let link = Url.comment(post, item);
        let localeAction = `${localeRoot}.action`;
        let picture = null;
        switch (notificationType) {
            case type.POST_REPLY:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)} <strong>{post.summary}</strong>
                    </span>
                );
                bodyContent = item.summary;
                break;
            case type.COMMENT_REPLY:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)} <strong>{item.parentSummary}</strong>
                    </span>
                );
                bodyContent = item.summary;
                break;
            case type.ANNOUNCEMENT:
            case type.ANNOUNCEMENT_IMPORTANT:
            //todo: use announcement comment 'image' as icon post steemfest. This will require addl info from yo.
            case type.FEED:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}{' '}
                    </span>
                );
                bodyContent = item.summary;
                break;
            case type.RECEIVE_STEEM:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = (
                    <span>
                        {amount}{' '}
                        <span className="subject"> {tt('g.steem')}</span>
                    </span>
                );
                break;
            case type.RESTEEM:
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = item.summary;
                link = Url.comment(item);
                break;
            case type.SECURITY_PWD_CHANGE:
            case type.SECURITY_WITHDRAWAL:
            case type.SECURITY_NEW_MOBILE:
            case type.POWER_DOWN:
                headerContent = (
                    <span>
                        <span className="subject">
                            {tt(`${localeRoot}.subject`)}
                        </span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = tt(`${localeRoot}.body`);
                picture = (
                    <div
                        className="Userpic"
                        dangerouslySetInnerHTML={{ __html: badges.important }}
                    />
                );
                break;
            case type.MENTION:
            case type.VOTE:
                localeAction = localeRoot + '.actionComment';
                if (0 === item.depth) {
                    localeAction = localeRoot + '.actionPost';
                    link = Url.comment(item);
                }
                headerContent = (
                    <span>
                        <span className="user">{author}</span>{' '}
                        {tt(localeAction)}
                    </span>
                );
                bodyContent = item.summary;
                break;
            default:
                console.log(
                    `no option for this notification ${notificationType}`,
                    this.props
                );
                return null;
        }

        if (!picture) {
            switch (notificationType) {
                //case type.ANNOUNCEMENT_IMPORTANT :
                //todo: special image - unknown json format in notification
                case type.POWER_DOWN:
                    //todo: blank circle image
                    break;
                default:
                    picture = <Userpic account={author} badge={badge} />;
            }
        }

        const readControl = (
            <div
                className="rightControls"
                onClick={read ? this.markUnread : this.markRead}
                dangerouslySetInnerHTML={{
                    __html: read ? badges.visibilityOn : badges.visibilityOff,
                }}
            />
        );
        return (
            <Link
                to={link}
                className={classNames}
                onClick={e => {
                    if (this.props.onClick) {
                        this.props.onClick(e);
                    }
                    this.markReadDefault(e);
                }}
            >
                {!this.props.shown ? (
                    <span
                        className="unseenIndicator"
                        dangerouslySetInnerHTML={{ __html: '&#9679' }}
                    />
                ) : null}
                <div className="item-panel">
                    <div
                        className={
                            'Comment__Userpic show-for-medium ' +
                            notificationType
                        }
                    >
                        {picture}
                    </div>
                    <div className="item-header">{headerContent}</div>
                    {bodyContent ? (
                        <div className="item-body">{bodyContent}</div>
                    ) : null}
                    <div className="item-footer">
                        <TimeAgoWrapper date={created} className="updated" />
                    </div>
                </div>
                {readControl}
            </Link>
        );
    }
}

export default connect(null, dispatch => ({
    markRead: id => dispatch(notificationActions.updateOne(id, { read: true })),
    markUnread: id =>
        dispatch(notificationActions.updateOne(id, { read: false })),
    markShown: id =>
        dispatch(notificationActions.updateOne(id, { shown: true })),
}))(Notification);
