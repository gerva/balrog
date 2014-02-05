import simplejson as json
import mock
import unittest
from xml.dom import minidom

from auslib.AUS import AUS3
from auslib.blob import ReleaseBlobV1

def RandomAUSTest(AUS, backgroundRate, force, mapping):
    with mock.patch('auslib.db.Rules.getRulesMatchingQuery') as m:
        m.return_value=[dict(backgroundRate=backgroundRate, priority=1, mapping=mapping, update_type='minor')]

        results = AUS.rand.getRange()
        resultsLength = len(results)
        def se(*args, **kwargs):
            return results.pop()
        with mock.patch('auslib.AUS.AUSRandom.getInt') as m2:
            m2.side_effect = se
            served = 0
            tested = 0
            while len(results) > 0:
                r, _ = AUS.evaluateRules(dict(channel='foo', force=force, buildTarget='a', buildID='a', locale='a'))
                tested +=1
                if r:
                    served += 1
                # bail out if we're not asking for any randint's
                if resultsLength == len(results):
                    break
            return (served, tested)

class TestAUSThrottling(unittest.TestCase):
    def setUp(self):
        self.AUS = AUS3()
        self.AUS.setDb('sqlite:///:memory:')
        self.AUS.db.create()
        self.AUS.db.releases.t.insert().execute(name='b', product='b', version='b', data_version=1, data='{"name": "b", "platforms": {}}')

    def testThrottling100(self):
        (served, tested) = RandomAUSTest(self.AUS, backgroundRate=100, force=False, mapping='b')
        self.assertEqual(served, 1)
        self.assertEqual(tested, 1)

    def testThrottling50(self):
        (served, tested) = RandomAUSTest(self.AUS, backgroundRate=50, force=False, mapping='b')
        self.assertEqual(served,  50)
        self.assertEqual(tested, 100)

    def testThrottling25(self):
        (served, tested) = RandomAUSTest(self.AUS, backgroundRate=25, force=False, mapping='b')
        self.assertEqual(served,  25)
        self.assertEqual(tested, 100)

    def testThrottlingZero(self):
        (served, tested) = RandomAUSTest(self.AUS, backgroundRate=0, force=False, mapping='b')
        self.assertEqual(served,   0)
        self.assertEqual(tested, 100)

    def testThrottling25WithForcing(self):
        (served, tested) = RandomAUSTest(self.AUS, backgroundRate=25, force=True, mapping='b')
        self.assertEqual(served, 1)
        self.assertEqual(tested, 1)

class TestAUS(unittest.TestCase):
    def setUp(self):
        self.AUS = AUS3()
        self.AUS.setSpecialHosts(('http://special.org/',))
        self.AUS.setDb('sqlite:///:memory:')
        self.AUS.db.setDomainWhitelist(('special.org',))
        self.AUS.db.create()
        self.relData = {}
        self.relData['b'] = ReleaseBlobV1(
            name='b',
            schema_version=1,
            appv='b',
            extv='b',
            hashFunction='sha512',
            platforms=dict(
                p=dict(
                    buildID=1,
                    locales=dict(
                        l=dict(
                            complete={
                                'filesize': '1',
                                'from': '*',
                                'hashValue': '1',
                                'fileUrl': 'http://special.org/?foo=a',
                            }
                        ),
                        m=dict(
                            complete={
                                'filesize': '1',
                                'from': '*',
                                'hashValue': '1',
                                'fileUrl': 'http://boring.org/a',
                            }
                        )
                    )
                )
            )
        )
        self.AUS.db.releases.t.insert().execute(name='b', product='b', version='b', data_version=1, data=json.dumps(self.relData['b']))

    def testSpecialQueryParam(self):
        updateData = self.AUS.expandRelease(
            dict(name=None, buildTarget='p', locale='l', channel='foo', force=False),
            self.relData['b'],
            'minor',
        )
        self.assertEqual(updateData['patches'][0]['URL'],
                         'http://special.org/?foo=a')

    def testSpecialQueryParamForced(self):
        updateData = self.AUS.expandRelease(
            dict(name=None, buildTarget='p', locale='l', channel='foo', force=True),
            self.relData['b'],
            'minor',
        )
        self.assertEqual(updateData['patches'][0]['URL'],
                         'http://special.org/?foo=a&force=1')

    def testNonSpecialQueryParam(self):
        updateData = self.AUS.expandRelease(
            dict(name=None, buildTarget='p', locale='m', channel='foo', force=False),
            self.relData['b'],
            'minor',
        )
        self.assertEqual(updateData['patches'][0]['URL'],
                         'http://boring.org/a')

    def testNonSpecialQueryParamForced(self):
        updateData = self.AUS.expandRelease(
            dict(name=None, buildTarget='p', locale='m', channel='foo', force=True),
            self.relData['b'],
            'minor',
        )
        self.assertEqual(updateData['patches'][0]['URL'],
                         'http://boring.org/a')

    def testMultipleSpecialHosts(self):
        self.AUS.setSpecialHosts(('http://special.org/', 'http://veryspecial.org'))
        updateData = self.AUS.expandRelease(
            dict(name=None, buildTarget='p', locale='l', channel='foo', force=True),
            self.relData['b'],
            'minor',
        )
        self.assertEqual(updateData['patches'][0]['URL'],
                         'http://special.org/?foo=a&force=1')

    def testNoSpecialDefined(self):
        self.AUS.setSpecialHosts(None)
        updateData = self.AUS.expandRelease(
            dict(name=None, buildTarget='p', locale='m', channel='foo', force=True),
            self.relData['b'],
            'minor',
        )
        self.assertEqual(updateData['patches'][0]['URL'],
                         'http://boring.org/a')

    def testCreateXMLAllowedDomain(self):
        xml = self.AUS.createXML(
            dict(name=None, buildTarget='p', locale='l', channel='foo', force=False),
            self.relData['b'],
            'minor',
        )
        # We need to load and re-xmlify these to make sure we don't get failures due to whitespace differences.
        returned = minidom.parseString(xml)
        expected = minidom.parseString("""<?xml version="1.0"?>
<updates>
    <update type="minor" version="b" extensionVersion="b" buildID="1">
        <patch type="complete" URL="http://special.org/?foo=a" hashFunction="sha512" hashValue="1" size="1"/>
    </update>
</updates>
""")
        self.assertEqual(returned.toxml(), expected.toxml())

    def testCreateXMLForbiddenDomain(self):
        # A CEF event gets logged when a forbidden domain is detected,
        # which depends on a Request being set.
        # We don't care about cef events here though, so we'll mock them away
        # See http://docs.python.org/dev/library/unittest.mock#id4 for why
        # AUS.cef_event is patched instead of log.cef_event
        with mock.patch('auslib.AUS.cef_event') as c:
            c.return_value = None
            xml = self.AUS.createXML(
                dict(name=None, buildTarget='p', locale='m', channel='foo', force=False),
                self.relData['b'],
                'minor',
            )
            # An empty update contains an <updates> tag with a newline, which is what we're expecting here
            self.assertEqual(minidom.parseString(xml).getElementsByTagName('updates')[0].firstChild.nodeValue, '\n')
