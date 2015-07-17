if( typeof StringTree === 'undefined' ) {
	var StringTree = require('../StringTree');
}

describe('StringTree', function(){

	it('must get and set values', function(){
		var st = new StringTree();
		st.set("foo", "bar", "baz", {hello: "world"});

		expect(st.get("foo", "bar", "baz")).toEqual({hello: "world"});
	});

	it("should return undefined when key is missing", function() {
		var st = new StringTree();
		st.set("foo", "bar", "baz", {hello: "world"});
		expect(typeof st.get("foo", "bar", "baz", "bat")).toEqual("undefined");
		expect(typeof st.get("goo", "bar", "baz")).toEqual("undefined");
	});

	it("must sort numeric values correctly", function() {
		var st = new StringTree();
		st.set("foo", {
			"01": {val: 1},
			"03": {val: 3},
			"02": {val: 2},
			"10": {val: 10}
		});

		expect(st._getSortedKeys(st.get("foo"))).toEqual(["01", "02", "03", "10"]);
	});

	it("must get max key correctly", function() {
		var st = new StringTree();
		st.set("foo", {
			"01": {val: 1},
			"03": {val: 3},
			"02": {val: 2},
			"10": {val: 10}
		});

		expect(st.maxKey("foo")).toEqual("10");
	});

	it("must get min key correctly", function() {
		var st = new StringTree();
		st.set("foo", {
			"01": {val: 1},
			"03": {val: 3},
			"02": {val: 2},
			"10": {val: 10}
		});

		expect(st.minKey("foo")).toBe("01");
	});

	it("must throw when less than 2 params are passed to set", function() {
		var st = new StringTree();

		try {
			st.set();
			console.log("FOO");
			fail();
		}
		catch (e) { /* pass */ }

		try {
			st.set(1);
			console.log("BAR");
			fail();
		}
		catch (e) { /* pass */ }
	});

	it("must throw when less than 1 param is passed to get", function() {
		var st = new StringTree();
		st.set("foo", 1);

		try {
			st.get();
			fail();
		}
		catch (e) { /* pass */ }
	});

});