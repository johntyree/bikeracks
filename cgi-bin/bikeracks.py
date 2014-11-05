#!/usr/bin/python
# -*- coding: utf-8 -*-

from __future__ import division, print_function

from contextlib import contextmanager
import cgi
import json
import os
import re
import sqlite3 as sql
import sys

print("Content-Type: text/plain\n\n")

DBFILE = os.path.expanduser('~/bikeracks.db')
KEY_ID = 'rack_id'
KEY_VALUE = 'url'
TABLE = 'photos'
INSPECT_DB_SCHEMA = r'''
    PRAGMA TABLE_INFO({table});
'''.format(table=TABLE)
CREATE_DB_SCHEMA = r'''
    CREATE TABLE IF NOT EXISTS {table} ({id} int, {value} text);
'''.format(table=TABLE, id=KEY_ID, value=KEY_VALUE)
DROP_DB_SCHEMA = r'''DROP TABLE IF EXISTS {table};'''.format(table=TABLE)
STORE_QUERY = r'''INSERT INTO {table} VALUES (:id, :value);'''.format(
    table=TABLE)
RETRIEVE_QUERY = r'''SELECT {value} FROM {table} WHERE {id}=:id;'''.format(
    value=KEY_VALUE, table=TABLE, id=KEY_ID)
VALUE_VALIDATOR = re.compile(
    r'^https?://i.imgur.com/\w+.(jpg|png|gif)$')

GET = 'REQUEST_METHOD_GET'
POST = 'REQUEST_METHOD_POST'
DELETE = 'REQUEST_METHOD_DELETE'
PUT = 'REQUEST_METHOD_PUT'
INVALID = 'REQUEST_METHOD_INVALID'
REQUEST_METHODS = {
    'GET': GET,
    'POST': POST,
    'DELETE': DELETE,
    'PUT': PUT,
}

GET_URI_VALIDATOR = re.compile(r"^/bikeracks/rack/\d+(?:-\d+)?$")
POST_URI_VALIDATOR = GET_URI_VALIDATOR

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
        c.execute(DROP_DB_SCHEMA)


def initialize_db():
    with db_cursor() as c:
        try:
            c.execute(INSPECT_DB_SCHEMA)
            cols = tuple(x[1] for x in c.fetchall())
            assert cols == (KEY_ID, KEY_VALUE)
        except AssertionError, sql.OperationalError:
            delete()
        c.execute(CREATE_DB_SCHEMA)


def validate_params(values):
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
    good, res = validate_params(params)
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
        links = [link for links in c.fetchall() for link in links]
    return links


def validate_route(form, get_validator, post_validator):
    BAD_PARAM = 'Required parameter {0!r} missing mismatched.\n\n{1!r}'
    BAD_REQUEST = 'URL invalid for request of type {0!r}'
    method = INVALID
    params = {'reason': 'unable to route request'}
    uri = os.environ['REQUEST_URI']
    request_type = REQUEST_METHODS.get(os.environ['REQUEST_METHOD'], INVALID)
    if request_type == GET:
        if get_validator.match(uri):
            key = get_from_form(form, KEY_ID)
            if key is not None:
                method = GET
                params = {KEY_ID: key}
            else:
                method = INVALID
                params = {'reason': BAD_PARAM.format(KEY_ID, form)}
        else:
            method = INVALID
            params = {'reason': BAD_REQUEST.format(request_type)}
            return method, params
    elif request_type == POST:
        if post_validator.match(uri):
            key = get_from_form(form, KEY_ID)
            if key is not None:
                value = get_from_form(form, KEY_VALUE)
                if value is not None:
                    method = POST
                    params = {KEY_ID: key, KEY_VALUE: value}
                    return method, params
                else:
                    method = INVALID
                    params = {'reason': BAD_PARAM.format(KEY_ID, form)}
                    return method, params
            else:
                method = INVALID
                params = {'reason': BAD_PARAM.format(KEY_ID, form)}
                return method, params
        else:
            method = INVALID
            params = {'reason': BAD_REQUEST.format(request_type)}
            return method, params
    return method, params


def get_from_form(form, key):
    if key in form:
        if isinstance(form[key], list):
            val = getattr(form[key][0], 'value', form[key][0])
            if all(v.value == val for v in form[key]):
                return val
        else:
            val = getattr(form[key], 'value', form[key])
            return val
    return None


def dump_environ():
    for k, v in os.environ.items():
        print("{0}: {1}".format(k, v))

def main():
    try:
        form = cgi.FieldStorage()
        method, params = validate_route(
            form, GET_URI_VALIDATOR, POST_URI_VALIDATOR)
        initialize_db()
        resp = {'error': 'Undefined response'}
        if method == GET:
            resp = {'data': retrieve(params[KEY_ID])}
        elif method == POST:
            resp = {'data': store(params[KEY_ID], params[KEY_VALUE])}
        elif method == INVALID:
            resp = {'error': params['reason']}
        else:
            resp = {'error': "This should never happen. Go hide under the bed."}
        print(json.dumps(resp))
    except Exception as e:
        import traceback
        a, b, c = sys.exc_info()
        traceback.print_exception(a, b, c, 100, sys.stdout)


if __name__ == '__main__':
    main()
