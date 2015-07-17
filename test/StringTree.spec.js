if( typeof StringTree === 'undefined' ) {
	var StringTree = require('../StringTree');
}

describe('StringTree', function(){

	it('must get and set values', function(){
		var st = new StringTree();
		st.set("foo", "bar", "baz", {hello: "world"});

		expect(st.get("foo", "bar", "baz")).toEqual({hello: "world"});
	});

	it("must throw when trying to set a property of a leaf node", function() {
		var st = new StringTree();
		st.set("foo", "bar", "baz", {hello: "world"});
		try {
			st.set("foo", "bar", "baz", "bat", {msg: "this should fail"});
			fail();
		}
		catch (e) { /* pass */ }
	});

	it("must return undefined when key is missing", function() {
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

	it("should not recurse into passed values", function() {
		var st = new StringTree();
		st.set("foo", {bar: {baz: true} });

		expect(typeof st.get("foo", "bar")).toEqual("undefined");
		expect(typeof st.get("foo", "bar", "baz")).toEqual("undefined");
	});

	it("should return inner structure for partial queries", function() {
		var st = new StringTree();
		st.set("foo", "bar", "baz", {hello: "world"});
		expect(st.get("foo")).toEqual({bar: {baz: {hello: "world"}}});
	});

	it("should return the next keylist correctly", function() {

		var st = new StringTree();
		st.set("2015","01", "03", {date: "2015-01-03"});
		st.set("2015","01", "02", {date: "2015-01-02"});
		st.set("2015","01", "01", {date: "2015-01-01"});
		st.set("2014","12", "31", {date: "2014-12-31"});
		st.set("2014","12", "30", {date: "2014-12-30"});
		st.set("2014","12", "29", {date: "2014-12-29"});

		try {
			st.nextKeylist("2015", "01", "04");
			fail();
		}
		catch (e) { /* pass */ }

		expect(typeof st.nextKeylist("2015", "01", "03")).toBe("undefined");
		expect(st.nextKeylist("2015", "01", "02")).toEqual(["2015", "01", "03"]);
		expect(st.nextKeylist("2015", "01", "01")).toEqual(["2015", "01", "02"]);
		expect(st.nextKeylist("2014", "12", "31")).toEqual(["2015", "01", "01"]);
		expect(st.nextKeylist("2014", "12", "30")).toEqual(["2014", "12", "31"]);
		expect(st.nextKeylist("2014", "12", "29")).toEqual(["2014", "12", "30"]);
	});

	it("nextKeylist should recurse as much as possible, but no more", function() {

		var st = new StringTree();
		st.set("2015","01", "01", {date: "2015-01-01"});
		st.set("2015","02", "01", "01", {date: "2015-02-01-01"});

		expect(st.nextKeylist("2015", "01", "01")).toEqual(["2015", "02", "01", "01"]);
	});

});