import logging
from os import path
import site

from paste.auth.basic import AuthBasicHandler

mydir = path.dirname(path.abspath(__file__))
site.addsitedir(mydir)
site.addsitedir(path.join(mydir, 'vendor/lib/python'))

if __name__ == '__main__':
    from optparse import OptionParser
    parser = OptionParser()
    parser.set_defaults(
        db='sqlite:///update.db',
        port=9000,
        whitelistedDomains=[
            "download.mozilla.org",
            "stage.mozilla.org",
            "ftp.mozilla.org",
            "ciscobinary.openh264.org",
        ],
    )

    parser.add_option("-d", "--db", dest="db", help="database to use, relative to inputdir")
    parser.add_option("-p", "--port", dest="port", type="int", help="port for server")
    parser.add_option("--host", dest="host", default='127.0.0.1', help="host to listen on. for example, 0.0.0.0 binds on all interfaces.")
    parser.add_option("--whitelist-domain", dest="whitelistedDomains", action="append")
    parser.add_option("--cef-log", dest="cefLog", default="cef.log")
    parser.add_option("--page-title", dest="pageTitle", default="AUS Management")
    parser.add_option("-v", "--verbose", dest="verbose", action="store_true",
        help="Verbose output")
    options, args = parser.parse_args()

    # Logging needs to get set-up before importing the application
    # to make sure that logging done from other modules uses our Logger.
    import auslib.log

    logging.setLoggerClass(auslib.log.BalrogLogger)
    log_level = logging.INFO
    if options.verbose:
        log_level = logging.DEBUG
    logging.basicConfig(level=log_level, format=auslib.log.log_format)

    from auslib import dbo
    from auslib.admin.base import app
    from migrate.exceptions import DatabaseAlreadyControlledError

    auslib.log.cef_config = auslib.log.get_cef_config(options.cefLog)
    dbo.setDb(options.db)
    dbo.setDomainWhitelist(options.whitelistedDomains)
    try:
        dbo.create()
    except DatabaseAlreadyControlledError:
        pass

    app.config['WHITELISTED_DOMAINS'] = options.whitelistedDomains
    app.config['SECRET_KEY'] = 'abc123'
    app.config['DEBUG'] = True
    app.config['PAGE_TITLE'] = options.pageTitle
    def auth(environ, username, password):
        return username == password
    app.wsgi_app = AuthBasicHandler(app.wsgi_app, "Balrog standalone auth", auth)
    app.run(port=options.port, host=options.host)
