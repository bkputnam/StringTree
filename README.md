![Build Status](https://travis-ci.org/bkputnam/StringTree.svg?branch=master)

# StringTree
StringTree is a sorted tree structure. Internally it's implemented as Javascript
objects inside of objects, with strings for keys. You may optionally provide a
comparator function which defines a sort order over the keys. If no comparator
is provided, the default comparator attempts to parse the keys as ints and then
compares them numerically.

Basic functionality looks like this:

```javascript
var st = new StringTree();
st.set("foo", "bar", "baz", {hello: "world"});
var result = st.get("foo", "bar", "baz"); // result = {hello: "world"}
```

You can also get the min and max keys at any level:

```javascript
var st = new StringTree();
st.set("foo", "01", {val: 1});
st.set("foo", "02", {val: 1});
st.set("foo", "03", {val: 1});

var result = st.maxKey("foo"); // result = "03"
```

The comparator allows you to get the next "keylist" in lexicographical order,
according to your comparator:

```javascript
var st = new StringTree();
st.set("2015","01", "03", {});
st.set("2015","01", "02", {});
st.set("2015","01", "01", {});
st.set("2014","12", "31", {});
st.set("2014","12", "30", {});
st.set("2014","12", "29", {});

// nextResult = ["2015", "01", "01"]
var nextResult = st.nextKeylist("2014", "12", "31");

// prevResult = ["2014", "12", "31"]
var prevResult = st.prevKeylist("2015", "01", "01");
```

You can pass custom comparators to StringTree, the format is the same as you
would pass to `Array.sort(comparatorFn)` (Mozilla docs
[here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort))

```javascript
var reverseAlphabeticComparator = function(a, b) {
	return a < b ? 1 : a > b ? -1 : 0;
}

var st = new StringTree(reverseAlphabeticComparator);
st.set("a", "a", {});
st.set("a", "b", {});
st.set("b", "a", {});
st.set("b", "b", {});

var nextResult = st.nextKeylist("b", "b"); // nextResult = ["b", "a"]
```