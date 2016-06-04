var getFields = function (fieldsTexts) {
	var fields = [];
	fieldsTexts.split(';').forEach(function (fieldText) {
		fieldText = fieldText.trim();
		if (!fieldText) {
			return;
		}
		opts = fieldText.split(/\s+/);
		fields.push({
			required: (opts[0] == 'required'),
			type: opts[1],
			name: opts[2]
		});
	});

	return fields;
};

module.exports = function textToSchema(text) {
	var rules =  text.match(/\w+\s\{.*?\}/g);

	var schamas = {};
	rules.forEach(function (ruleText){
		var name = ruleText.match(/\w+/);

		schamas[name] = getFields(ruleText.match(/\{(.*?)\}/)[1]);
	});

	return schamas;
}