import mock
import simplejson as json

from sqlalchemy import select

from auslib.web.base import db
from auslib.test.web.views.base import ViewTest, JSONTestMixin

class TestReleasesAPI_JSON(ViewTest, JSONTestMixin):
    def testLocalePut(self):
        details = json.dumps(dict(complete=dict(filesize=435)))
        ret = self._put('/releases/a/builds/p/l', data=dict(details=details, product='a', version='a'))
        self.assertStatusCode(ret, 201)
        ret = select([db.releases.data]).where(db.releases.name=='a').execute().fetchone()[0]
        self.assertEqual(json.loads(ret), json.loads("""
{
    "name": "a",
    "platforms": {
        "p": {
            "locales": {
                "l": {
                    "complete": {
                        "filesize": 435
                    }
                }
            }
        }
    }
}
"""))

    def testLocalePutRetry(self):
        # In order to test the retry logic we need to mock out the method used
        # to grab the current data_version. The first time through, it needs
        # to return the wrong one to trigger the retry logic. The second time
        # through it needs to return the correct one, to make sure retrying
        # results in success still.
        with mock.patch('auslib.web.base.db.releases.getReleases') as r:
            results = [[dict(data_version=1)], [dict(data_version=431)]]
            def se(*args, **kwargs):
                print results
                return results.pop()
            r.side_effect = se
            details = json.dumps(dict(complete=dict(filesize=435)))
            ret = self._put('/releases/a/builds/p/l', data=dict(details=details, product='a', version='a'))
            self.assertStatusCode(ret, 201)
            self.assertEqual(r.call_count, 2)
            ret = select([db.releases.data]).where(db.releases.name=='a').execute().fetchone()[0]
            self.assertEqual(json.loads(ret), json.loads("""
{
    "name": "a",
    "platforms": {
        "p": {
            "locales": {
                "l": {
                    "complete": {
                        "filesize": 435
                    }
                }
            }
        }
    }
}
"""))

    def testLocalePutBadJSON(self):
        ret = self._put('/releases/a/builds/p/l', data=dict(details='a', product='a', version='a'))
        self.assertStatusCode(ret, 400)

    def testLocaleGet(self):
        ret = self._get('/releases/d/builds/p/d')
        self.assertStatusCode(ret, 200)
        self.assertEquals(json.loads(ret.data), dict(complete=dict(filesize=1234)))
