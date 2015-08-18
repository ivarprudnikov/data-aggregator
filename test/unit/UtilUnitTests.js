var
  should = require('should'),
  extend = require('../../server/util/extend'),
  _ = require('underscore')
  ;

describe('Util Unit Tests', function(){

  it('merges objects', function(done){

    var target = {};
    extend(target, {foo: 'bar'}, {foo:'baz'});
    target.foo.should.eql('baz');
    done();
  });

});
