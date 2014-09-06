#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division, print_function

from contextlib import contextmanager
import cgi
import json
import os
import re
import sqlite3 as sql

print("Content-type: text/html\n\n")

DBFILE = os.path.expanduser('~/bikeracks.db')
KEY_ID = 'rack_id'
KEY_VALUE = 'url'
TABLE = 'photos'
INSPECT_SCHEMA = '''
    PRAGMA TABLE_INFO({table});
'''.format(table=TABLE)
CREATE_SCHEMA = '''
    CREATE TABLE IF NOT EXISTS {table} ({id} int, {value} text);
'''.format(table=TABLE, id=KEY_ID, value=KEY_VALUE)
DROP_SCHEMA = '''DROP TABLE IF EXISTS {table};'''.format(table=TABLE)
STORE_QUERY = '''INSERT INTO {table} VALUES (:id, :value);'''.format(
    table=TABLE)
RETRIEVE_QUERY = '''SELECT {value} FROM {table} WHERE {id}=:id;'''.format(
    value=KEY_VALUE, table=TABLE, id=KEY_ID)
VALUE_VALIDATOR = re.compile(
    '^https?://i.imgur.com/\w+.(jpg|png|gif)$')

DBCONN = None

@contextmanager
def db_cursor():
    global DBCONN
    conn = DBCONN or sql.connect(DBFILE)
    c = conn.cursor()
    yield c
    conn.commit()


def delete():
    with db_cursor() as c:
        c.execute(DROP_SCHEMA)


def initialize():
    with db_cursor() as c:
        try:
            c.execute(INSPECT_SCHEMA)
            cols = tuple(x[1] for x in c.fetchall())
            assert cols == (KEY_ID, KEY_VALUE)
        except AssertionError, sql.OperationalError:
            delete()
        c.execute(CREATE_SCHEMA)


def valid(values):
    values = values.copy()
    if 'id' in values:
        try:
            values['id'] = int(values['id'])
        except ValueError:
            return False, 'Bad ID: {0}'.format(values['id'])
        if values['id'] < 0:
            return False, 'Negative ID: {0}'.format(values['id'])
    if 'value' in values:
        if values['value'] and not VALUE_VALIDATOR.match(values['value']):
            return False, 'Bad Value: ' + str(values['value'])
        else:
            values['value'] = cgi.escape(values['value'])
    return True, values


def _params_query(cursor, params, query):
    good, res = valid(params)
    if good:
        params = res
        cursor.execute(query, params)
        return "OK!"
    else:
        return res


def store(id, value):
    with db_cursor() as c:
        return _params_query(c, {'id': id, 'value': value}, STORE_QUERY)


def remove(id, value):
    with db_cursor() as c:
        return _params_query(c, {'id': id, 'value': value}, REMOVE_QUERY)


def retrieve(id):
    with db_cursor() as c:
        _params_query(c, {'id': id}, RETRIEVE_QUERY)
        links = c.fetchall()
    return links


def main():
    initialize()
    form = cgi.FieldStorage()
    if KEY_ID and KEY_VALUE in form:
        resp = store(form[KEY_ID].value, form[KEY_VALUE].value)
    elif KEY_ID in form:
        resp = retrieve(form[KEY_ID].value)
    else:
        resp = "Expected at least {0}".format(KEY_ID)
    print(json.dumps(resp))


if __name__ == '__main__':
    main()
