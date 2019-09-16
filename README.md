## Features

fast format your selected snippets, to create your code snippets easily in vscode

formatted snippets eg:

```
"your description": {
	"scope": "",
	"prefix": "initB",
	"body": [
		"<body>",
		"\t<div class=\"effect\">",
		"\t\t<div class=\"blackball\"></div>",
		"\t\t<div class=\"redball\"></div>",
		"\t</div>",
		"</body>",
	],
	"description": "Log output to console"
}
```

## Release Notes

### 1.0.0

first simple version

### 1.0.1

fix tab problem.
now, tab in snippets will format as '\\t'(like the example above), because use '\t' will get lint error in vscode

