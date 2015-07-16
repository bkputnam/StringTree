if( typeof StringTree === 'undefined' ) {
	var StringTree = require('../StringTree');
}

describe('StringTree', function(){

	it('must get and set values', function(){

		var st = new StringTree();
		st.set("foo", "bar", "baz", {hello: "world"});

		expect(st.get("foo", "bar", "baz")).toEqual({hello: "world"});
	});

});