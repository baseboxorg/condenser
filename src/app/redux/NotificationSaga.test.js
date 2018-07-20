import { call, put, select } from 'redux-saga/effects';
import { fetchNotifications } from 'app/utils/YoApiClient';
import { fetchAll, fetchSome } from './NotificationSaga';
import { selectors as userSelectors } from './UserReducer';
import {
    receiveAll,
    selectors as notificationSelectors,
} from './NotificationReducer';

describe('fetchAll', () => {
    it('should get the username from state', () => {
        const gen = fetchAll();

        const withUsername = gen.next().value;
        expect(withUsername).toEqual(select(userSelectors.getUsername));

        const withPayload = gen.next('basil frankenweiler').value;
        expect(withPayload).toEqual(
            call(fetchNotifications, 'basil frankenweiler')
        );

        const fetch = gen.next({ data: 'from online' }).value;
        expect(fetch).toEqual(put(receiveAll({ data: 'from online' })));

        const done = gen.next();
        expect(done).toEqual({ done: true, value: undefined });
    });
});

describe('fetchSome', () => {
    it('should work with sane defaults', () => {
        const gen = fetchSome({});

        const withUsername = gen.next().value;
        expect(withUsername).toEqual(select(userSelectors.getUsername));

        const withNotifsNoFilter = gen.next().value;
        expect(withNotifsNoFilter).toEqual(
            select(notificationSelectors.getNotificationsById)
        );

        const callFetch = gen.next().value;
        expect(callFetch.CALL.args).toEqual(['after', undefined]);
    });
});
