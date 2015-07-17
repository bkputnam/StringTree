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
				if (shadowRoot.hasOwnProperty(key)) {
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
				if (!shadowRoot.hasOwnProperty(key)) {
					shadowRoot[key] = {};
					root[key] = {};
				}
				root = root[key];
				shadowRoot = shadowRoot[key];
			}
			root[lastKey] = value;
			shadowRoot[lastKey] = {};
		}
	};

	StringTree.prototype._getSortedKeys = function(obj) {
		return Object.keys(obj).sort(this.comparator);
	};

	StringTree.prototype.maxKey = function() {
		var value = this.get.apply(this, arguments);

		var keys = Object.keys(value);
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

	StringTree.prototype.minKey = function() {
		var value = this.get.apply(this, arguments);

		var keys = Object.keys(value);
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
	};

	function isEmptyObject(obj) { return Object.keys(obj).length == 0; }

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
		if (!isEmptyObject(shadowNode)) {
			throw "Keys must reference a leaf node in StringTree.nextKeylist";
		}

		// Walk up the parentStack until we find a parent
		// for whom we do not already have the maximum index.
		// Record the index at which we were able to make
		// this increment.
		var nextKey = undefined;
		var incrementableIndex;
		for (incrementableIndex=arguments.length-1; i>=0; i--) {
			currentNode = parentStack[incrementableIndex];
			var key = arguments[incrementableIndex];
			var sortedKeys = this._getSortedKeys(currentNode);
			var keyIndex = sortedKeys.indexOf(key);

			if (keyIndex != sortedKeys.length-1) {
				nextKey = sortedKeys[keyIndex+1];
			}
		}

		var result = Array.prototype.slice(arguments, 0, incrementableIndex);
		result.push(nextKey);
		for (var i=incrementableIndex; i<arguments.length; i++) {
			result.push()
		}
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

