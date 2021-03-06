if( typeof StringTree === 'undefined' ) {
	var StringTree = require('../StringTree');
}

describe('StringTree', function(){

	var reverseAlphabeticComparator = function(a, b) {
		return (
			a < b ? 1 :
			a > b ? -1 :
			0
		);
	};

	function populateThreeLevelTree(st, lvl1Keys, lvl2Keys, lvl3Keys) {
		var index = 0;
		lvl1Keys.forEach(function(lvl1Key) {
			lvl2Keys.forEach(function(lvl2Key) {
				lvl3Keys.forEach(function(lvl3Key) {
					st.set(lvl1Key, lvl2Key, lvl3Key, {val: index});
					index++;
				})
			})
		});

		return st;
	}

	var SORTED_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
	var SORTED_NUMBERS = [
		"1", "2", "3", "04",
		"11", "12", "13",
		"20", "30", "40"
	];
	var SORTED_MAMMALS = ["cat", "dog", "heffalump", "moose", "mouse"];

	var ALPHABETICALLY_SORTED_NUMBERS = ['04', '1', '11', '12', '13', '2', '20', '3', '30', '40'];

	var SHUFFLED_LETTERS = "hrtlzmvwqsnkxyjpcoeiufdgab".split("");
	var SHUFFLED_NUMBERS = ["40", "30", "1", "04", "12", "13", "2", "20", "3", "11"];
	var SHUFFLED_MAMMALS = ["cat", "mouse", "heffalump", "moose", "dog"];

	var REVERSE_LETTERS = "zyxwvutsrqponmlkjihgfedcba".split("");
	var REVERSE_NUMBERS = ["40", "30", "20", "13", "12", "11", "04", "3", "2", "1"];
	var REVERSE_MAMMALS = ["mouse", "moose", "heffalump", "dog", "cat"];

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

		expect(st.getSortedKeys("foo")).toEqual(["01", "02", "03", "10"]);
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

	it("should return prev keylist correctly", function() {

		var st = new StringTree();
		st.set("2015","01", "03", {date: "2015-01-03"});
		st.set("2015","01", "02", {date: "2015-01-02"});
		st.set("2015","01", "01", {date: "2015-01-01"});
		st.set("2014","12", "31", {date: "2014-12-31"});
		st.set("2014","12", "30", {date: "2014-12-30"});
		st.set("2014","12", "29", {date: "2014-12-29"});

		try {
			st.prevKeylist("2015", "01", "04");
			fail();
		}
		catch (e) { /* pass */ }

		expect(st.prevKeylist("2015", "01", "03")).toEqual(["2015", "01", "02"])
		expect(st.prevKeylist("2015", "01", "02")).toEqual(["2015", "01", "01"]);
		expect(st.prevKeylist("2015", "01", "01")).toEqual(["2014", "12", "31"]);
		expect(st.prevKeylist("2014", "12", "31")).toEqual(["2014", "12", "30"]);
		expect(st.prevKeylist("2014", "12", "30")).toEqual(["2014", "12", "29"]);
		expect(typeof st.prevKeylist("2014", "12", "29")).toBe("undefined");
	});

	it("nextKeylist should recurse as much as possible, but no more", function() {

		var st = new StringTree();
		st.set("2015","02", "01", {date: "2015-02-01"});
		st.set("2015","01", "01", "01", {date: "2015-01-01-01"});

		expect(st.prevKeylist("2015", "02", "01")).toEqual(["2015", "01", "01", "01"]);
	});

	it("should use custom comparators correctly", function() {
		var st = new StringTree(reverseAlphabeticComparator);
		st.set("a", "a", {});
		st.set("a", "b", {});
		st.set("b", "a", {});
		st.set("b", "b", {});

		expect(st.nextKeylist("b", "b")).toEqual(["b", "a"]);
		expect(st.nextKeylist("b", "a")).toEqual(["a", "b"]);
		expect(st.nextKeylist("a", "b")).toEqual(["a", "a"]);
		expect(typeof st.nextKeylist("a", "a")).toBe("undefined");
	});

	it("sortedKeys should work correctly", function() {

		var st = new StringTree();
		st.set("2015", "06", "19", {});
		st.set("2015", "06", "17", {});
		st.set("2015", "06", "22", {});
		st.set("2015", "06", "06", {});
		st.set("2015", "06", "10", {});

		st.set("2015", "03", "23", {});
		st.set("2015", "03", "07", {});
		st.set("2015", "03", "20", {});
		st.set("2015", "03", "08", {});
		st.set("2015", "03", "11", {});

		st.set("2014", "12", "31", {});

		expect(st.getSortedKeys()).toEqual(["2014", "2015"]);
		expect(st.getSortedKeys("2015")).toEqual(["03", "06"]);
		expect(st.getSortedKeys("2015", "03")).toEqual(["07", "08", "11", "20", "23"]);
		expect(st.getSortedKeys("2015", "06")).toEqual(["06", "10", "17", "19", "22"]);

	});

	it("sortedKeys should fail correctly", function() {

		var st = new StringTree();

		expect(st.getSortedKeys()).toEqual([]);
		expect(typeof st.getSortedKeys("2015")).toEqual("undefined");
		expect(typeof st.getSortedKeys("2015", "03")).toEqual("undefined");
		expect(typeof st.getSortedKeys("2015", "06")).toEqual("undefined");

	});

	// bugfix: calling st.minKey() or st.maxKey() with no parameters
	// failed due to get() failing with no parameters
	it("must get root min and max keys correctly", function() {
		var st = new StringTree();
		st.set("2015", {});
		st.set("1999", {});
		st.set("2013", {});
		st.set("2014", {});

		expect(st.minKey()).toEqual("1999");
		expect(st.maxKey()).toEqual("2015");
	});

	it("should be able to sort different levels differently", function() {
		var st = new StringTree();
		populateThreeLevelTree(st, SHUFFLED_LETTERS, SHUFFLED_NUMBERS, SHUFFLED_MAMMALS);

		st.setDefaultComparator(StringTree.localeComparator);
		st.setLevelComparator(1, StringTree.parseIntComparator);

		expect(st.getSortedKeys()).toEqual(SORTED_LETTERS);
		expect(st.getSortedKeys("a")).toEqual(SORTED_NUMBERS);
		expect(st.getSortedKeys("a", "1")).toEqual(SORTED_MAMMALS);
	});

	it("constructor should accept parameters (defaultComparator, levelComparators)", function() {
		var st = new StringTree(StringTree.localeComparator, [StringTree.parseIntComparator]);
		populateThreeLevelTree(st, SHUFFLED_NUMBERS, SHUFFLED_LETTERS, SHUFFLED_MAMMALS);

		expect(st.getSortedKeys()).toEqual(SORTED_NUMBERS);
		expect(st.getSortedKeys("1")).toEqual(SORTED_LETTERS);
		expect(st.getSortedKeys("1", "a")).toEqual(SORTED_MAMMALS);
	});

	it("constructor should accept parameters (defaultComparator)", function() {
		var st = new StringTree(StringTree.localeComparator);
		populateThreeLevelTree(st, SHUFFLED_NUMBERS, SHUFFLED_LETTERS, SHUFFLED_MAMMALS);

		expect(st.getSortedKeys()).toEqual(ALPHABETICALLY_SORTED_NUMBERS);
		expect(st.getSortedKeys("1")).toEqual(SORTED_LETTERS);
		expect(st.getSortedKeys("1", "a")).toEqual(SORTED_MAMMALS);
	});

	it("constructor should accept parameters (levelComparators)", function() {
		var st = new StringTree([StringTree.localeComparator, StringTree.localeComparator]);
		populateThreeLevelTree(st, SHUFFLED_LETTERS, SHUFFLED_MAMMALS, SHUFFLED_NUMBERS);

		expect(st.getSortedKeys()).toEqual(SORTED_LETTERS);
		expect(st.getSortedKeys("a")).toEqual(SORTED_MAMMALS);
		expect(st.getSortedKeys("a", "dog")).toEqual(SORTED_NUMBERS);
	});

});