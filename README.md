![Build Status](https://travis-ci.org/bkputnam/StringTree.svg?branch=master)

# StringTree
StringTree is a sorted tree structure. Internally it's implemented as Javascript
objects inside of objects, with strings for keys. The keys are sorted via
comparator functions. There is one default comparator for the whole tree, and
each level of the tree may have its own comparator that overrides the default.
If no comparators are specified, the tree will use a single default comparator
for all levels that attempts to parse the keys as ints and then compares them
numerically.

## Constructor

There are 4 forms of the constructor:

```javascript
var st = new StringTree(); // [1]
var st = new StringTree(comparator); // [2]
var st = new StringTree(comparatorArray); // [3]
var st = new StringTree(comparator, comparatorArray); // [4]
```

1. Use the default values: use `StringTree.parseIntComparator` as the comparator
for the whole tree.
2. Specify your own comparator to use for the whole tree.
3. Similar to [1], use `[StringTree.parseIntComparator]` as the default for the whole tree, but
specify per-level overrides starting at level 0. Levels greater than `comparatorArray.length` will
fall back to the default comparator. The parameter `comparatorArray` must be an array of functions.
In particular `Array.isArray(comparatorArray)` must return true or the code will think that [2]
was invoked instead.
4. Specify both the default comparator (`comparator`) and per-level overrides starting at level 0
(`comparatorArray`).

If you need to specify comparator overrides in a manner other than "starting at level 0" you should
use the `setLevelComparator` function (see "Configuring Comparators" below).

## Getting and Setting Values

`StringTree.prototype.set` takes 2 or more arguments. The final argument is the value to be stored
in the tree. All other arguments specify the path or location within the tree at which the value
should be stored. Any paths that don't already exist will be created. You cannot store values inside
other values so for example this will throw an exception:

```javascript
var st = new StringTree();
st.set("foo", { bar: { baz: 1 } });
st.set("foo", "bar", { frob: 2 });
```

`StringTree.prototype.get` takes any number of arguments and will return the object that was
previously stored at that location. If no object was found at that location, or if the specified
path was invalid `undefined` will be returned.

Here's a basic example of the two functions:

```javascript
var st = new StringTree();
st.set("foo", "bar", "baz", {hello: "world"});
var result = st.get("foo", "bar", "baz"); // result = {hello: "world"}
```

## Querying the Tree

Once your data is in the tree, there are a number of questions you can ask about it.

### `minKey` and `maxKey`

`StringTree.prototype.minKey` and `StringTree.prototype.maxKey` take any number of arguments, which
specify a partial path within the tree. They return the min or max value at the next level,
according to the configured comparators.

```javascript
var st = new StringTree();
st.set("foo", "01", {val: 1});
st.set("foo", "02", {val: 1});
st.set("foo", "03", {val: 1});

var min = st.minKey("foo"); // result = "01"
var max = st.maxKey("foo"); // result = "03"
```

### `getSortedKeys`

`StringTree.prototype.getSortedKeys` takes any number of arguments, which specify a partial path
within the tree. It returns all of the key at the next level, sorted according to the appropriate
comparator.

```javascript
var st = new StringTree();
st.set("foo", "01", {val: 1});
st.set("foo", "02", {val: 1});
st.set("foo", "03", {val: 1});

var result = st.getSortedKeys("foo"); // result = ["01", "02", "03"]
```

### `nextKeylist` and `prevKeylist`

`StringTree.prototype.nextKeylist` and `StringTree.prototype.prevKeylist` take any number of
arguments which specify a complete path within the tree. They will then traverse the tree structure
to find the next or previous entry, as if the entire tree was sorted
[lexicographically](https://en.wikipedia.org/wiki/Lexicographical_order) by your various
comparators.

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

## Configuring Comparators

You can pass custom comparators to StringTree. The function signature is the same as you
would pass to `Array.sort(comparatorFn)` (Mozilla docs
[here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort))

### setDefaultComparator

`StringTree.prototype.setDefaultComparator` takes a single argument and overwrites the current
default comparator. It is similar to constructor [2] above.

```javascript
var reverseAlphabeticComparator = function(a, b) {
	return a < b ? 1 : a > b ? -1 : 0;
}

var st = new StringTree();
st.setDefaultComparator(reverseAlphabeticComparator); // could also use constructor [2]
st.set("a", "a", {});
st.set("a", "b", {});
st.set("b", "a", {});
st.set("b", "b", {});

var nextResult = st.nextKeylist("b", "b"); // nextResult = ["b", "a"]
```

### setLevelComparator

`StringTree.prototype.setLevelComparator` takes two parameters: `levelIndex` (int) and `comparator`
(function). It overrides the default comparator at that level (depth) of the tree (zero-index).
If another override has already been specified, this overwrites that.

