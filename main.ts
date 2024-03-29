import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface Config {
	apiKey: string;
}

const DEFAULT_SETTINGS: Config = {
	apiKey: ''
}


// jsonPayload=$(cat <<EOF
// {
//   "contents": [{
//     "parts": [{
//       "text": "$*"
//     }],
//   }]
// }
// EOF
// )
//
//
// curl -sS \
//   -H 'Content-Type: application/json' \
//   -d "$jsonPayload" \
//   -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDbKNOhQeOU4cV2zBm8Tx1ptFX80AV1u9c" | jq -r '.candidates[0].content.parts[0].text' | glow


async function generateContent(text: string, apiKey: string): Promise<string> {

	const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

	const jsonPayload = JSON.stringify({
		"contents": [{
			"parts": [{
				"text": text
			}],
		}]
	});

	const headers = {
		"Content-Type": "application/json",
	}

	const response = await fetch(`${url}?key=${apiKey}`, {
		method: "POST",
		headers: headers,
		body: jsonPayload
	});

	return response.text();

}

export default class MyPlugin extends Plugin {
	settings: Config;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'generate-command',
			name: 'Generate content from selected',
			editorCallback: async (editor: Editor, view: MarkdownView) => {

				let line = editor.getCursor().line;
				let selected_text = editor.getSelection() ? editor.getSelection() : editor.getLine(line);
				console.log(selected_text);
				// let content = await generateContent(selected_text, this.settings.apiKey);
				// let content_parsed = JSON.parse(content).candidates[0].content.parts[0].text;
				let content_parsed = "asd"
				editor.setLine(line, `${selected_text}\n${content_parsed}`);
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('BardApi Key')
			.setDesc('Enter Google AI Studio api key')
			.addText(text => text
				.setPlaceholder('Enter your api key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
