#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import division, print_function

import cgi
import re
import json
import sys
import os
from contextlib import contextmanager

import pymongo

import bikeracks as BR

REPLICA_SET = "8ece19933559130a12e17f35c404570f"
HOSTS = 'dfw-c9-1.objectrocket.com:37175,dfw-c9-0.objectrocket.com:37175'
USER = os.environ.get('MONGO_USER') or 'br'
PASSWORD = os.environ.get('MONGO_PASSWORD') or 'br'
DB = 'br'
URL = "mongodb://{user}:{password}@{hosts}/{db}".format(
    user=USER, password=PASSWORD, hosts=HOSTS, db=DB)
mongo_client = pymongo.MongoClient(URL, replicaSet=REPLICA_SET)

GET_URI_VALIDATOR = re.compile(r"^/bikeracks_mongo/rack/\d+(?:-\d+)?$")
POST_URI_VALIDATOR = GET_URI_VALIDATOR


@contextmanager
def db_collection():
    yield getattr(mongo_client, DB).racks


def delete():
    mongo_client.drop_database(DB)


def store(id, value):
    with db_collection() as racks:
        prev = racks.find_one({BR.KEY_ID: id})
        if prev:
            new_value = prev.pop(BR.KEY_VALUE)
            new_value.append(value)
            racks.update(prev, {'$set': {BR.KEY_VALUE: new_value}})
        else:
            new_value = {BR.KEY_ID: id, BR.KEY_VALUE: [value]}
            racks.insert(new_value)


def remove(id, value):
    with db_collection() as racks:
        prev = racks.find_one({BR.KEY_ID: id})
        if prev:
            new_value = prev[BR.KEY_VALUE]
            new_value.remove(value)
            racks.update(prev, {'$set': {BR.KEY_VALUE: new_value}})


def retrieve(id):
    with db_collection() as racks:
        prev = racks.find_one({BR.KEY_ID: id})
        return prev[BR.KEY_VALUE] if prev else []


def main():
    try:
        try:
            form = json.load(sys.stdin)
        except ValueError:
            try:
                form = cgi.FieldStorage()
            except TypeError:
                form = {}
        method, params = BR.validate_route(
            form, GET_URI_VALIDATOR, POST_URI_VALIDATOR)
        if method == BR.GET:
            resp = {'data': retrieve(params[BR.KEY_ID])}
        elif method == BR.POST:
            resp = {'data': store(params[BR.KEY_ID], params[BR.KEY_VALUE])}
        elif method == BR.INVALID:
            resp = {'error': params['reason']}
        else:
            resp = {'error': 'Undefined request method'}
        print(json.dumps(resp))
    except Exception as e:
        import traceback
        a, b, c = sys.exc_info()
        traceback.print_exception(a, b, c, 100, sys.stdout)


if __name__ == '__main__':
    main()
