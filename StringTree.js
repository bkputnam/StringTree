(function(globals) {

	function StringTree(comparator) {
		this.comparator = comparator || StringTree.defaultComparator;
		this.root = {};
		this._shadowRoot = {};
	}

	StringTree.defaultComparator = function(a, b) {
		a = parseInt(a);
		b = parseInt(b);
		if (a < b) { return -1; }
		else if (b < a) { return 1; }
		else { return 0; }
	};

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

	StringTree.prototype._getSortedKeys = function(obj) {
		return Object.keys(obj).sort(this.comparator);
	};

	StringTree.prototype._maxKey = function(obj) {
		if (obj === null) {
			return undefined;
		}
		
		var keys = Object.keys(obj);
		if (keys.length===0) {
			return undefined;
		}

		var maxKey = keys[0];
		for (var i=1; i<keys.length; i++) {
			if (this.comparator(keys[i], maxKey) > 0) {
				maxKey = keys[i];
			}
		}
		return maxKey;
	};

	StringTree.prototype.maxKey = function() {
		return this._maxKey(this.get.apply(this, arguments));
	};

	StringTree.prototype._minKey = function(obj) {
		if (obj === null) {
			return undefined;
		}

		var keys = Object.keys(obj);
		if (keys.length===0) {
			return undefined;
		}

		var minKey = keys[0];
		for (var i=1; i<keys.length; i++) {
			if (this.comparator(keys[i], minKey) < 0) {
				minKey = keys[i];
			}
		}
		return minKey;
	}

	StringTree.prototype.minKey = function() {
		return this._minKey(this.get.apply(this, arguments));
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
		// Record the index at which we were able to make
		// this increment.
		var nextKey = undefined;
		var incrementableIndex;
		for (incrementableIndex=arguments.length-1; incrementableIndex>=0; incrementableIndex--) {
			currentNode = parentStack[incrementableIndex];
			var key = arguments[incrementableIndex];
			var sortedKeys = this._getSortedKeys(currentNode);
			var keyIndex = sortedKeys.indexOf(key);

			if (keyIndex != sortedKeys.length-1) {
				nextKey = sortedKeys[keyIndex+1];
				break;
			}
		}

		// No indices were incrementable; the input was already
		// the max key in the collection
		if (incrementableIndex < 0) {
			return undefined;
		}

		var result = Array.prototype.slice.call(arguments, 0, incrementableIndex);

		currentNode = parentStack[incrementableIndex];
		shadowNode = shadowStack[incrementableIndex];
		while(typeof nextKey !== "undefined" && shadowNode.hasOwnProperty(nextKey)) {
			result.push(nextKey);
			currentNode = currentNode[nextKey];
			shadowNode = shadowNode[nextKey];


			nextKey = this._minKey(shadowNode);
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

