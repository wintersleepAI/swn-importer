import { Constants } from './constants.js';
import { Coordinates } from './model/coordinates.js';
import { Options } from './model/options.js';
import { PositionedEntity } from './model/positioned-entity.js';
import { Sector } from './model/sector.js';
import { SectorTree } from './model/sector-tree.js';
import { NoteUtils } from './note-utils.js';
import { Utils } from './utils.js';

export class SceneUtils {

    /**
     * Gets a Foundry Scene Data object to generate a scene for a sector
     * @param sectorTree The sector tree to generate a scene for
     * @param options The options object
     * @returns The Foundry Scene Data
     */
    static getSceneData(sectorTree, options) {
        const sector = sectorTree.root.entity;

        const sceneData = {
            active: false,
            flags: Utils.getNodeFlags(sectorTree.root),
            grid: 0.3,
            gridColor: Constants.GRID_COLOR,
            gridType: Utils.getLabel("HEX-UNIT-NAME"),
            height: this.getSceneHeight(sector.rows),
            background: {
                src: options.backgroundPath,
                color: Constants.BACKGROUND_COLOR,
                alpha: 1
            },
            thumb: options.backgroundPath,
            name: Utils.getTimestampedName(Scenes.instance, sectorTree.root.entity.name),
            padding: 0,
            notes: NoteUtils.getSectorNotes(sectorTree, options),
            width: this.getSceneWidth(sector.columns),
            drawings: this.getSectorLabels(sectorTree, options)
        };

        return sceneData;
    }

    static getSceneHeight(rows) {
        return Math.floor((rows + 1) * Constants.HEX_HEIGHT);
    }

    static getSceneWidth(columns) {
        return Math.floor((((3 / 4) * Constants.HEX_WIDTH) * columns) + ((1 / 4) * Constants.HEX_WIDTH));
    }

    static getSectorLabels(sectorTree, options) {
        const labels = [];

        if (options.generateSectorCoordinates) {
            const sector = sectorTree.root.entity;
            for (let row = 0; row < sector.rows; row++) {
                for (let column = 0; column < sector.columns; column++) {
                    const coordinates = this.getHexCenterPosition(column, row);

                    const label = {
                        x: coordinates.x,
                        y: coordinates.y + (9 / 10) * Constants.HEX_VERTICAL_RADIUS,
                        text: Utils.getHexCoordinates(column, row),
                        fontSize: 16
                    };
                    labels.push(label);
                }
            }
        }

        if (options.generateHexName) {
            sectorTree.root.children
                .filter(node => node.type !== 'note')
                .forEach(node => {
                    const system = node.entity;
                    const coordinates = this.getHexCenterPosition(system.x - 1, system.y - 1);
                    const label = {
                        x: coordinates.x - Math.floor(Constants.HEX_HEIGHT / 2),
                        y: coordinates.y - (9 / 10) * Constants.HEX_VERTICAL_RADIUS,
                        text: node.entity.name,
                        fontSize: 16
                    };
                    labels.push(label);
                });
        }

        return labels;
    }

    static getHexCenterPosition(column, row) {
        let verticalOffset = 0;

        if (column % 2 === 0) {
            verticalOffset = Constants.HEX_VERTICAL_RADIUS;
        } else {
            verticalOffset = 2 * Constants.HEX_VERTICAL_RADIUS;
        }

        return {
            x: ((3 / 4) * Constants.HEX_WIDTH * column) + Constants.HEX_RADIUS,
            y: (Constants.HEX_HEIGHT * row) + Constants.HEX_VERTICAL_RADIUS + verticalOffset
        };
    }
}
