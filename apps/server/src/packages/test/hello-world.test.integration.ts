import * as sinon from 'sinon';
import { assert } from 'chai';

describe('Integration - Hello World', function() {
  it('Can print to the console', function() {
    const stub = sinon.stub(console, 'log');
    const text = 'fake news';
    console.log(text);
    stub.restore();
    assert.equal(stub.callCount, 1);
    assert.isTrue(stub.calledWith(text));
  });
});
