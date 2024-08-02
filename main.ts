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
        const mahjongHands = el.createDiv({ cls: 'mahjong-hands-wrapper' })

        // Split by new line
        source.split('\n').forEach(sourceLine => {
            const handContainer = mahjongHands.createDiv({ cls: 'mahjong-hand' });
            try {
                const handWrapper = handContainer.createDiv({ cls: 'mahjong-hand-wrap' })
                const tiles = parseHand(sourceLine);
                const hasStackedTiles = source.includes('"')
                if (hasStackedTiles) {
                    handContainer.classList.add('has-stacked')
                }
                tiles.forEach(tile => {
                    if (tile === 'space') {
                        this.createSpaceElement(handWrapper);
                    } else {
                        const tileElement = this.createTileElement(tile, handWrapper);
                    }
                });
            } catch (error) {
                handContainer.setText(`Error: ${error.message}`);
            }
        })
    }

    createTileElement(tile: string, parent: HTMLElement): HTMLElement {
        const tileContainer = parent.createEl('span')
        tileContainer.classList.add('mahjong-tile');

        const isRotated = tile.includes("'");
        const isStacked = tile.includes('"');
        tile = tile.replace(/['"]/, '');

        if (isRotated) {
            tileContainer.classList.add('rotated');
        }

        if (isStacked) {
            tileContainer.classList.add('stacked');
            this.createStackedTile(tile, tileContainer);
        } else {
            this.createSingleTile(tile, tileContainer);
        }

        return tileContainer;
    }

    createSingleTile(tile: string, container: HTMLElement) {
        const compositeTile = container.createEl('div')
        compositeTile.classList.add('tile-design')
        const backgroundTile = compositeTile.createEl('img')
        backgroundTile.src = this.getAssetPath('Tile')
        backgroundTile.alt = 'Tile Background'

        const tileElement = compositeTile.createEl('img');
        tileElement.src = this.getAssetPath(tile as keyof typeof Tiles.light);
        tileElement.classList.add('tile-print')
        tileElement.alt = tile;
    }

    createStackedTile(tile: string, container: HTMLElement) {
        this.createSingleTile(tile, container);
        this.createSingleTile(tile, container);
    }

    createSpaceElement(parent: HTMLElement): HTMLElement {
        const spaceElement = parent.createEl('span');
        spaceElement.classList.add('mahjong-space');
        return spaceElement;
    }

    getAssetPath(tile: keyof typeof Tiles.light): string {
        const theme = this.getCurrentTheme();
        return Tiles[theme][tile] as unknown as string;
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