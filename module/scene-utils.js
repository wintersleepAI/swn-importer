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
            grid: {
                type: CONST.GRID_TYPES.HEXODDQ,
                units: Utils.getLabel("HEX-UNIT-NAME"),
                color: Constants.GRID_COLOR,
                size: Constants.HEX_WIDTH,
                alpha: 0.3,
                distance: 1,
            },
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

    static getTextLabel(text, x, y) {          
        return {
            _id: foundry.utils.randomID(),
            author: game.user.id,
            x,
            y,
        
            // Required shape (minimal rectangle works best for pure text)
            shape: {
                type: foundry.data.ShapeData.TYPES.RECTANGLE,
                width: 20,
                height: 10,
                radius: 1,
                points: []
            },
        
            text,
            fontSize: 16,
            fillColor: null,        // can be null if text is visible
            strokeWidth: 0,         // ok, because text is visible
            strokeColor: null,
            flags: {}
        };
    }


    static getSectorLabels(sectorTree, options) {
        const labels = [];

        if (options.generateSectorCoordinates) {
            const sector = sectorTree.root.entity;
            for (let row = 0; row < sector.rows; row++) {
                for (let column = 0; column < sector.columns; column++) {
                    const coordinates = this.getHexCenterPosition(column, row);
                    labels.push(this.getTextLabel(Utils.getHexCoordinates(column, row), coordinates.x, coordinates.y + (9 / 10) * Constants.HEX_VERTICAL_RADIUS));
                }
            }
        }

        if (options.generateHexName) {
            sectorTree.root.children
                .filter(node => node.type !== 'note')
                .forEach(node => {
                    const system = node.entity;
                    const coordinates = this.getHexCenterPosition(system.x - 1, system.y - 1);
                    labels.push(this.getTextLabel(node.entity.name, coordinates.x - Math.floor(Constants.HEX_HEIGHT / 2), coordinates.y - (9 / 10) * Constants.HEX_VERTICAL_RADIUS));
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
