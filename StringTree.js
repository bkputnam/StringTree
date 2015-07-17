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

	if( typeof exports !== 'undefined' ) {
		if( typeof module !== 'undefined' && module.exports ) {
			exports = module.exports = StringTree;
		}
		exports.mymodule = StringTree;
	} 
	else {
		global.mymodule = StringTree;
	}

})(this); // this will be window, if running in browser

