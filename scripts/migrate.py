#!/usr/bin/env python3
import __fix
from peewee_migrate import Router
import os
import argparse
from app import create_app
from app.models import dbp as database

app = create_app()
database.connect()

router = Router(database, migrate_dir='../migrations' if os.getcwd().endswith('scripts') else 'migrations',
                ignore=['basemodel'])

parser = argparse.ArgumentParser(description='Apply or manage database migrations.')
parser.add_argument('-c', '--create', metavar='NAME', help='Creates a new migration')
parser.add_argument('-a', '--auto', metavar='NAME', help='Creates a new migration (automatic)')
parser.add_argument('-r', '--rollback', metavar='NAME', help='Rolls back a migration')
parser.add_argument('-l', '--list', action='store_true', help='List migration table')

args = parser.parse_args()

if args.create:
    router.create(args.create)
elif args.auto:
    router.create(args.auto, 'app')
elif args.rollback:
    router.rollback(args.rollback)
elif args.list:
    print("\n".join(m.name for m in router.model.select()))
else:
    router.run()
