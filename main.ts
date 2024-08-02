import { Plugin, MarkdownPostProcessorContext, App, PluginSettingTab, Setting, normalizePath } from 'obsidian';
import { parseHand } from './src/mahjongNotation';
import { Tiles } from 'assets/assets';

export default class MahjongNotationPlugin extends Plugin {
    async onload() {
        this.registerMarkdownCodeBlockProcessor('mahjong', this.mahjongProcessor.bind(this));

        this.registerEvent(
            this.app.workspace.on('css-change', () => {
                this.updateAllMahjongHands();
            })
        );
    }

    mahjongProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const mahjongHands = el.createDiv({ cls: 'mahjong-hands-wrapper' });
        mahjongHands.dataset.source = source
        this.renderMahjongHands(source, mahjongHands);
    }

    renderMahjongHands(source: string, container: HTMLElement) {
        // Clear existing content
        container.empty();
        // Split by new line
        source.split('\n').forEach(sourceLine => {
            const handContainer = container.createDiv({ cls: 'mahjong-hand' });
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
        const isBack = tile.startsWith('5zr')
        const compositeTile = container.createEl('div')
        compositeTile.classList.add('tile-design')
        const backgroundTile = compositeTile.createEl('img')
        backgroundTile.src = isBack ? this.getAssetPath('5zr') : this.getAssetPath('Tile')
        backgroundTile.alt = 'Tile Background'

        if (isBack) {
            return
        }
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
        const mahjongHandsWrappers = document.querySelectorAll<HTMLDivElement>('.mahjong-hands-wrapper');
        mahjongHandsWrappers.forEach(wrapper => {
            const sourceValue = wrapper.dataset.source
            if (!sourceValue) {
                return
            }
            console.log('SOURCE', sourceValue)
            this.renderMahjongHands(sourceValue, wrapper);
            })
    }
}
