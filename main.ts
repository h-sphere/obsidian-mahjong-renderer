import { Plugin, MarkdownPostProcessorContext, App, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import { parseHand } from './src/mahjongNotation';
import { Tiles } from 'assets/assets';

interface MahjongNotationPluginSettings {
    tileSize: number;
}

const DEFAULT_SETTINGS: MahjongNotationPluginSettings = {
    tileSize: 32
};

export default class MahjongNotationPlugin extends Plugin {
    settings: MahjongNotationPluginSettings;

    async onload() {
        await this.loadSettings();

        this.registerMarkdownCodeBlockProcessor('mahjong', this.mahjongProcessor.bind(this));

        this.addSettingTab(new MahjongNotationSettingTab(this.app, this));

        // Register an event to update tiles when the theme changes
        this.registerEvent(
            this.app.workspace.on('css-change', () => {
                this.updateAllMahjongHands();
            })
        );
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    mahjongProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const handContainer = el.createDiv({ cls: 'mahjong-hand' });

        try {
            const tiles = parseHand(source);
            tiles.forEach(tile => {
                const tileElement = this.createTileElement(tile, handContainer);
            });
        } catch (error) {
            handContainer.setText(`Error: ${error.message}`);
        }
    }

    createTileElement(tile: string, parent: HTMLElement): HTMLElement {
        const tileContainer = parent.createEl('span')
        tileContainer.classList.add('mahjong-tile');

        const backgroundTile = tileContainer.createEl('img')
        backgroundTile.src = this.getAssetPath('Tile')
        backgroundTile.alt = 'Tile Background'
        backgroundTile.width = this.settings.tileSize;
        backgroundTile.height = this.settings.tileSize;

        const tileElement = tileContainer.createEl('img');
        tileElement.src = this.getAssetPath(tile as keyof typeof Tiles.light);
        tileElement.alt = tile;
        tileElement.width = this.settings.tileSize * 0.8;
        tileElement.height = this.settings.tileSize * 0.8;

        
        return tileContainer;
    }

    getAssetPath(tile: keyof typeof Tiles.light): string {
        const theme = this.getCurrentTheme();

        return Tiles[theme][tile] as unknown as string
        return chun

        // const path = normalizePath(this.app.vault.adapter.basePath + '/' + this.app.vault.configDir + `/assets/${theme}/${tile}.png`)
        const path = this.app.vault.adapter.basePath + '/' + this.app.vault.configDir + `./assets/${theme}/${tile}.png`
        const file = this.app.vault.getFileByPath(path)
        console.log(file)
        return path;
        return app.vault.adapter.getResourcePath(`./assets/${theme}/${tile}.png`)
        return this.app.vault.adapter.getResourcePath(this.app.vault.configDir + "/plugins/" + this.manifest.id + `/assets/${theme}/${tile}.png`)
        return
        // return `.obsidian/plugins/mahjong-hand-renderer/assets/${theme}/${tile}.png`;
    }

    getCurrentTheme() {
        return document.body.classList.contains('theme-dark') ? 'dark' : 'light';
    }

    updateAllMahjongHands() {
        const mahjongHands = document.querySelectorAll('.mahjong-hand');
        mahjongHands.forEach(hand => {
            const tiles = hand.querySelectorAll('.mahjong-tile');
            tiles.forEach((tile: HTMLImageElement) => {
                const tileNotation = tile.alt;
                tile.src = this.getAssetPath(tileNotation);
            });
        });
    }
}

class MahjongNotationSettingTab extends PluginSettingTab {
    plugin: MahjongNotationPlugin;

    constructor(app: App, plugin: MahjongNotationPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.createEl('h2', {text: 'Mahjong Notation Settings'});

        new Setting(containerEl)
            .setName('Tile Size')
            .setDesc('Size of Mahjong tiles in pixels')
            .addSlider(slider => slider
                .setLimits(16, 64, 1)
                .setValue(this.plugin.settings.tileSize)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.tileSize = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateAllMahjongHands();
                }));
    }
}