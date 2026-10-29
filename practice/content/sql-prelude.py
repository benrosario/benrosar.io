# SQLite answer checks: fresh in-memory databases for the reference and submitted query, for every fixture.
def run_sql(job):
    import sqlite3, collections
    def execute(fixture, query):
        con = sqlite3.connect(':memory:')
        try:
            for name, table in fixture.items():
                cols = ', '.join('"' + k + '" ' + t for k, t in table['columns'])
                con.execute('CREATE TABLE "' + name + '" (' + cols + ')')
                if table['rows']:
                    con.executemany('INSERT INTO "' + name + '" VALUES (' + ','.join('?' for _ in table['columns']) + ')', table['rows'])
            steps = [0]
            def progress():
                steps[0] += 1
                return steps[0] > 2000
            con.set_progress_handler(progress, 100)
            # Submitted SQL cannot attach a filesystem database, change settings, or modify fixtures.
            def authorize(action, arg1, arg2, db, trigger):
                denied = (sqlite3.SQLITE_ATTACH, sqlite3.SQLITE_DETACH, sqlite3.SQLITE_PRAGMA,
                          sqlite3.SQLITE_UPDATE, sqlite3.SQLITE_DELETE, sqlite3.SQLITE_ALTER_TABLE,
                          sqlite3.SQLITE_DROP_TABLE, sqlite3.SQLITE_DROP_INDEX, sqlite3.SQLITE_DROP_VIEW,
                          sqlite3.SQLITE_CREATE_TRIGGER, sqlite3.SQLITE_CREATE_VIEW)
                if action in denied:
                    # CREATE TABLE AS writes SQLite's own schema, which is safe inside this disposable database.
                    if action == sqlite3.SQLITE_UPDATE and arg1 == 'sqlite_master' and job.get('table'):
                        return sqlite3.SQLITE_OK
                    return sqlite3.SQLITE_DENY
                if action == sqlite3.SQLITE_CREATE_TABLE and arg1 != job.get('table'):
                    return sqlite3.SQLITE_DENY
                if action == sqlite3.SQLITE_INSERT and arg1 not in (job.get('table'), 'sqlite_master'):
                    return sqlite3.SQLITE_DENY
                return sqlite3.SQLITE_OK
            con.set_authorizer(authorize)
            cur = con.execute(query)
            if job.get('table'):
                cur = con.execute('SELECT * FROM "' + job['table'] + '"')
            width = len(cur.description or [])
            rows = cur.fetchmany(10001)
            if len(rows) > 10000:
                raise ValueError('Query returned too many rows.')
            return width, [tuple(round(v, 9) if isinstance(v, float) else v for v in row) for row in rows]
        finally:
            con.close()
    fixtures = job['fixtures']
    if not fixtures:
        return {'ok': False, 'unavailable': True, 'err': 'No SQL datasets are configured.'}
    for i, fixture in enumerate(fixtures):
        try:
            expected = execute(fixture, job['expected'])
        except Exception as e:
            return {'ok': False, 'unavailable': True, 'err': 'Reference SQL could not run: ' + str(e)}
        try:
            actual = execute(fixture, job['query'])
        except Exception as e:
            return {'ok': False, 'n': len(fixtures), 'failed': 1, 'err': 'Dataset ' + str(i+1) + ': ' + str(e)}
        eq = actual == expected if job.get('ordered') else actual[0] == expected[0] and collections.Counter(actual[1]) == collections.Counter(expected[1])
        if not eq:
            return {'ok': False, 'n': len(fixtures), 'failed': 1, 'err': 'Dataset ' + str(i+1) + '\nExpected rows: ' + repr(expected[1][:8]) + '\nYour rows: ' + repr(actual[1][:8])}
    return {'ok': True, 'n': len(fixtures)}
