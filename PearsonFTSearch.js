/*
 * The MIT License
 * 
 * Copyright (c) 2012 MetaBroadcast
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */
var rest = require('restler');
var util = require('util');
var SearchResults = require('../modules/SearchResults');
var SearchResult = require('../modules/SearchResult');

var PearsonFTSearch = function(q, config, fn) {
	this.q = q;
	this.config = config;
	this.fn = fn; // callback function
};

PearsonFTSearch.prototype.run = function() {
	var url = 'https://api.pearson.com/ftpress/book.json?title=' + this.q
			+ '&apikey=' + this.config.apiKey;

	var o = this;
	var request;
	
	request = rest.get(url);
	
	var ftpress_timeout = setTimeout(function () {
		request.abort("timeout");
	}, this.config.timeout);
	
	request.on('complete', function(data) {
		clearTimeout(ftpress_timeout);
		var resultnum = 0;
		if (data.books) {
			for ( var i in data.books.book) {
				var content = data.books.book[i];
				var result = new SearchResult();
				result.addId("isbn", content["@id"]);
				result.title = content.title["#text"];
				result.source = "ftpress";
				result.type = "literary";
				result.thumbnail_url = "";
				o.fn(result);
				resultnum++;
				if (resultnum > o.config.limit) {
					break;
				}
			}
		} else {
			util.error("ftpress: Cannot understand response");
			util.error(data);
			util.error("=====");
		}
		o.fn("ftpress", true);
	});
};

module.exports = PearsonFTSearch;
