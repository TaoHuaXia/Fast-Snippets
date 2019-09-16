// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const snippetsLineTabCount = 3
function getTabCount(str) {
	const reg = /^(\t)+/g
	const result = reg.exec(str)
	if (!result) {
		return 0
	}
	// 分组出来的数据第一条即为所有的tab，而一个\t的长度为1，而不是2
	return result[0].length
}

function formatQuote(text) {
	return text.replace(/\"/g, '\\"')
}

function fixTab(text, tabCount) {
	if (tabCount !== 0) {
		while(tabCount > 0) {
			// 此处使用\\t，是因为使用\t vscode会报错，必须使用\t来代表换行符
			text = '\\t' + text
			tabCount--
		}
	}
	return text
}

function formatLine(text, firstLineTab, isEnd) {
	let result = ''

	// 获取文本行本身的tab数量
	let currentTab = getTabCount(text)

	// 与首行的tab数量进行对比，获取相对于首行的缩进差
	let offsetTab = currentTab - firstLineTab

	// 获取缩进差之后，清除文本的前后缩进
	result = text.trim()

	// 格式化初始文本中的双引号
	result = formatQuote(result)

	// 增加相对首行的缩进
	result = fixTab(result, offsetTab)

	// 包裹需要渲染出来的文本行，并添加“，”（body为数组，数组项之间需要“，”间隔）
	result = `\"${result}\"${isEnd ? '' : ','}`

	// 增加userSnippets所需的缩进
	result = Array(snippetsLineTabCount).fill('\t').join('') + result

	return result
}

function formatLines(textLine, firstLineTab) {
	// 遍历文本行
	return textLine.map((line, index) => {
		if (!line || line === '') {
			// 如果为空行，则直接返回空行
			return line
		} else {
			// 如果不是空行，则对文本进行格式化
			return formatLine(line, firstLineTab, index === firstLineTab.length - 1)
		}
	})
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const template = [
		'\t\"your description\": {',
		'\t\t\"scope\": \"\",',
		'\t\t\"prefix\": \"your prefix\",',
		'\t\t\"body\": [',
		'\t\t],',
		'\t\t\"description\": \"Log output to console\"',
		'\t\}',
	]

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fastsnipptes" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.getSnippets', function () {
		// 获取当前活动的编辑区
		const active = vscode.window.activeTextEditor
		
		// 如果没有活动的编辑区，或者没有选中的内容，则退出
		if (!active) {
			vscode.window.showErrorMessage('当前没有活动的文本编辑器！')
			return
		}
		if (active.selection.isEmpty) {
			vscode.window.showErrorMessage('当前没有选中的内容！')
			return
		}
		
		// 获取全部文本
		const document = active.document
		
		// 获取当前的选中区域
		const selection = active.selection
		
		// 根据选中区域获取起始、结束位置
		const startPosition = new vscode.Position(selection.start.line, selection.start.character)
		const endPosition = new vscode.Position(selection.end.line, selection.end.character)
		
		// 根据起始位置创建选中区域，并对范围进行校验，保证选中区域在文档内
		const selectedRange = document.validateRange(new vscode.Range(startPosition, endPosition))
		
		// 根据选中区域获取文本
		const text = document.getText(selectedRange)
		
		// 对首行以及尾行的缩进进行校验，两者必须相同
		const firstLine = document.lineAt(startPosition.line)
		const endLine = document.lineAt(endPosition.line)
		const firstLineTab = getTabCount(firstLine.text)
		const endLineTab = getTabCount(endLine.text)
		if (firstLineTab !== endLineTab) {
			vscode.window.showErrorMessage('代码片段的首尾行缩进应一致！')
			return
		}
		// 根据换行符对文本进行分行
		const textLine = text.split('\r\n')
		
		// 格式化首行的缩进
		if (getTabCount(textLine[0])) {
			textLine[0].replace(/^(\t)+/, Array(firstLineTab).fill('\t').join(''))
		} else {
			textLine[0].trim()
			textLine[0] = fixTab(textLine[0], firstLineTab)
		}
		
		// 对文本进行格式化
		const formattedTextLine = formatLines(textLine, firstLineTab)

		// 将格式化后的文本插入通用模板
		const result = [...template]
		result.splice(4, 0, ...formattedTextLine)

		// 将内容插入剪贴板
		vscode.env.clipboard.writeText(result.join('\r\n')).then(res => {
			vscode.window.showInformationMessage('代码已复制到剪贴板!')
		})
	});

	context.subscriptions.push(disposable);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
