(function(root) {

	function StringTree(comparator) {
		this.comparator = comparator;
		this.root = {};
	}

	StringTree.prototype.get = function() {
		var root = this.root;
		for (var i=0; i<arguments.length; i++) {
			var key = arguments[i];
			if (root.hasOwnProperty(key)) {
				root = root[key];
			}
			else {
				return undefined;
			}
		}
		return root;
	};

	StringTree.prototype.set = function() {
		var root = this.root;
		var value = arguments[arguments.length-1];
		var lastKey = arguments[arguments.length-2];
		for (var i=0; i<arguments.length-2; i++) {
			var key = arguments[i];
			if (!root.hasOwnProperty(key)) {
				root[key] = {};
			}
			root = root[key];
		}
		root[lastKey] = value;
	};

	if( typeof exports !== 'undefined' ) {
		if( typeof module !== 'undefined' && module.exports ) {
			exports = module.exports = StringTree;
		}
		exports.mymodule = StringTree;
	} 
	else {
		root.mymodule = StringTree;
	}

})(this);