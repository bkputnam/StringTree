(function(globals) {

	function assertFunction(fn, curFnName) {
		var isFunction = fn && ({}.toString.call(fn) == '[object Function]');
		if (!isFunction) {
			throw curFnName + ' :\'' + fn + '\' is not a function';
		}
	}

	function StringTree(comparator, comparators) {
		if( arguments.length === 2 ) {
			this.defaultComparator = comparator;
			this.levelComparators = comparators;
		}
		else if( arguments.length === 1 ) {
			if( Array.isArray( comparator ) ) {
				this.defaultComparator = StringTree.defaultComparator;
				this.levelComparators = comparator;
			}
			else {
				this.defaultComparator = comparator;
				this.levelComparators = {};
			}
		}
		else if( arguments.length === 0 ) {
			this.defaultComparator = StringTree.defaultComparator;
			this.levelComparators = {};
		}

		this.root = {};
		this._shadowRoot = {};
	}

	// This comparator compares keys by passing them through
	// parseInt and comparing the results in ascending order
	StringTree.parseIntComparator = function(a, b) {
		a = parseInt(a);
		b = parseInt(b);
		if (a < b) { return -1; }
		else if (b < a) { return 1; }
		else { return 0; }
	};

	// This comparator compares keys alphabetically using
	// String.prototype.localeCompare. This should usually
	// produce the desired results but it's worth noting
	// that this may produce different results in different
	// browsers or on computers with different location
	// settings.
	StringTree.localeComparator = function(a, b) {
		a = '' + a; // convert to string
		b = '' + b; // convert to string
		return a.localeCompare(b);
	};

	StringTree.defaultComparator = StringTree.parseIntComparator;

	StringTree.prototype.get = function() {
		if (arguments.length < 1) {
			throw "StringTree.get requires at least 1 parameter";
		}
		else {
			var root = this.root;
			var shadowRoot = this._shadowRoot;

			for (var i=0; i<arguments.length; i++) {
				var key = arguments[i];
				if (shadowRoot !== null && shadowRoot.hasOwnProperty(key)) {
					shadowRoot = shadowRoot[key];
					root = root[key];
				}
				else {
					return undefined;
				}
			}
			return root;
		}
	};

	StringTree.prototype.set = function() {
		if (arguments.length < 2) {
			throw "StringTree.set requires at least 2 parameters";
		}
		else {
			var root = this.root;
			var shadowRoot = this._shadowRoot;

			var value = arguments[arguments.length-1];
			var lastKey = arguments[arguments.length-2];
			for (var i=0; i<arguments.length-2; i++) {
				var key = arguments[i];
				if (shadowRoot === null) {
					throw "Can't add properties under a leaf node";
				}
				if (!shadowRoot.hasOwnProperty(key)) {
					shadowRoot[key] = {};
					root[key] = {};
				}
				root = root[key];
				shadowRoot = shadowRoot[key];
			}
			root[lastKey] = value;
			shadowRoot[lastKey] = null; // is a leaf node - can't set properties on a leaf node, can't set properties on 'null'
		}
	};

	StringTree.prototype.setDefaultComparator = function(comparator) {
		assertFunction(comparator, "setDefaultComparator");
		this.defaultComparator = comparator;
	};

	StringTree.prototype.setLevelComparator = function(levelIndex, comparator) {
		assertFunction(comparator, "setLevelComparator");
		this.levelComparators[levelIndex] = comparator;
	};

	StringTree.prototype._getLevelComparator = function(levelIndex) {
		if (this.levelComparators.hasOwnProperty(levelIndex)) {
			return this.levelComparators[levelIndex];
		}
		else {
			return this.defaultComparator;
		}
	};

	StringTree.prototype.getSortedKeys = function() {
		var obj = (arguments.length === 0)
			? this._shadowRoot
			: this.get.apply(this, arguments);

		return (typeof obj == "undefined")
			? undefined
			: this._getSortedKeys(obj, this._getLevelComparator(arguments.length));
	};

	StringTree.prototype._getSortedKeys = function(obj, comparator) {
		assertFunction(comparator, "_getSortedKeys");
		return Object.keys(obj).sort(comparator);
	};

	function _maxKey(obj, comparator) {
		assertFunction(comparator, "_maxKey");

		if (obj === null) {
			return undefined;
		}

		var keys = Object.keys(obj);
		if (keys.length===0) {
			return undefined;
		}

		var maxKey = keys[0];
		for (var i=1; i<keys.length; i++) {
			if (comparator(keys[i], maxKey) > 0) {
				maxKey = keys[i];
			}
		}
		return maxKey;
	};

	StringTree.prototype.maxKey = function() {
		var obj = (arguments.length === 0)
			? this._shadowRoot
			: this.get.apply(this, arguments);
		var comparator = this._getLevelComparator(arguments.length);

		return _maxKey(obj, comparator);
	};

	function _minKey(obj, comparator) {
		assertFunction(comparator, "_minKey");

		if (obj === null) {
			return undefined;
		}

		var keys = Object.keys(obj);
		if (keys.length===0) {
			return undefined;
		}

		var minKey = keys[0];
		for (var i=1; i<keys.length; i++) {
			if (comparator(keys[i], minKey) < 0) {
				minKey = keys[i];
			}
		}
		return minKey;
	}

	StringTree.prototype.minKey = function() {
		var obj = (arguments.length === 0)
			? this._shadowRoot
			: this.get.apply(this, arguments);
		var comparator = this._getLevelComparator(arguments.length);

		return _minKey(obj, comparator);
	};

	StringTree.prototype.nextKeylist = function() {
		var parentStack = [];
		var shadowStack = [];
		var currentNode = this.root;
		var shadowNode = this._shadowRoot;

		// Find the passed element
		for (var i=0; i<arguments.length; i++) {
			var key = arguments[i];
			if (shadowNode.hasOwnProperty(key)) {
				parentStack.push(currentNode);
				shadowStack.push(shadowNode);

				currentNode = currentNode[key];
				shadowNode = shadowNode[key];
			}
			else {
				throw "Unknown key '" + key + "' in StringTree.nextKeylist";
			}
		}

		// Passed element must be a leaf node
		if (shadowNode !== null) {
			throw "Keys must reference a leaf node in StringTree.nextKeylist";
		}

		// Walk up the parentStack until we find a parent
		// for whom we do not already have the maximum index.
		// When we're done, incrementableIndex will contain
		// the largest index which we were able to increment.
		var nextKey, incrementableIndex;
		for (incrementableIndex=arguments.length-1; incrementableIndex>=0; incrementableIndex--) {
			currentNode = parentStack[incrementableIndex];
			var comparator = this._getLevelComparator(incrementableIndex);

			var key = arguments[incrementableIndex];
			var sortedKeys = this._getSortedKeys(currentNode, comparator);
			var keyIndex = sortedKeys.indexOf(key);

			if (keyIndex != sortedKeys.length-1) {
				nextKey = sortedKeys[keyIndex+1];
				break;
			}
		}

		// If no indices were incrementable; the input was already
		// the max key in the collection so we should return undefined
		if (incrementableIndex < 0) {
			return undefined;
		}

		var result = Array.prototype.slice.call(arguments, 0, incrementableIndex);

		currentNode = parentStack[incrementableIndex];
		shadowNode = shadowStack[incrementableIndex];
		var index = incrementableIndex;
		while(typeof nextKey !== "undefined" && shadowNode.hasOwnProperty(nextKey)) {
			result.push(nextKey);
			currentNode = currentNode[nextKey];
			shadowNode = shadowNode[nextKey];
			var comparator = this._getLevelComparator(index)

			nextKey = _minKey(shadowNode, comparator);
			index++;
		}
		
		return result;
	};

	StringTree.prototype.prevKeylist = function() {
		var parentStack = [];
		var shadowStack = [];
		var currentNode = this.root;
		var shadowNode = this._shadowRoot;

		// Find the passed element
		for (var i=0; i<arguments.length; i++) {
			var key = arguments[i];
			if (shadowNode.hasOwnProperty(key)) {
				parentStack.push(currentNode);
				shadowStack.push(shadowNode);

				currentNode = currentNode[key];
				shadowNode = shadowNode[key];
			}
			else {
				throw "Unknown key '" + key + "' in StringTree.nextKeylist";
			}
		}

		// Passed element must be a leaf node
		if (shadowNode !== null) {
			throw "Keys must reference a leaf node in StringTree.nextKeylist";
		}

		// Walk up the parentStack until we find a parent
		// for whom we do not already have the minimum index.
		// When we're done, incrementableIndex will contain
		// the largest index which we were able to increment.
		var nextKey, incrementableIndex;
		for (incrementableIndex=arguments.length-1; incrementableIndex>=0; incrementableIndex--) {
			currentNode = parentStack[incrementableIndex];
			var comparator = this._getLevelComparator(incrementableIndex);

			var key = arguments[incrementableIndex];
			var sortedKeys = this._getSortedKeys(currentNode, comparator);
			var keyIndex = sortedKeys.indexOf(key);

			if (keyIndex !== 0) {
				nextKey = sortedKeys[keyIndex-1];
				break;
			}
		}

		// If no indices were incrementable; the input was already
		// the min key in the collection so we should return undefined
		if (incrementableIndex < 0) {
			return undefined;
		}

		var result = Array.prototype.slice.call(arguments, 0, incrementableIndex);

		currentNode = parentStack[incrementableIndex];
		shadowNode = shadowStack[incrementableIndex];
		var index = incrementableIndex;
		while(typeof nextKey !== "undefined" && shadowNode.hasOwnProperty(nextKey)) {
			result.push(nextKey);
			currentNode = currentNode[nextKey];
			shadowNode = shadowNode[nextKey];
			var comparator = this._getLevelComparator(index);

			nextKey = _maxKey(shadowNode, comparator);
			index++;
		}

		return result;
	};

	if( typeof exports !== 'undefined' ) {
		if( typeof module !== 'undefined' && module.exports ) {
			exports = module.exports = StringTree;
		}
		exports.StringTree = StringTree;
	} 
	else {
		globals.StringTree = StringTree;
	}

})(this); // this will be window, if running in browser

