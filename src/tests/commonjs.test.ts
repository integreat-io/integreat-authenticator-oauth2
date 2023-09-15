import test from 'ava'

import resources from '../index.js'

test('should have resources', (t) => {
  t.truthy(resources)
  t.truthy(resources.authenticators)
  t.truthy(resources.authenticators.oauth2)
})
