import { Constants } from './constants.js';
import { Coordinates } from './model/coordinates.js';
import { Options } from './model/options.js';
import { PositionedEntity } from './model/positioned-entity.js';
import { Sector } from './model/sector.js';
import { SectorTree } from './model/sector-tree.js';
import { NoteUtils } from './note-utils.js';
import { Utils } from './utils.js';

export class SceneUtils {


    static LABEL_WIDTH = 10;
    static LABEL_HEIGHT = 10;
    static OFFSET_X = this.LABEL_WIDTH / 2 + 1;
    static OFFSET_Y = this.LABEL_HEIGHT / 2 + 1;
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
                size: 173,
                alpha: 0.3,
                distance: 1,
            },
            height: this.getSceneHeight(sector.rows, sector.columns),
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

    static getTextLabel(text, x, y, fontSize = 16, textColor = "#ffffff") {          
        return {
            _id: foundry.utils.randomID(),
            author: game.user.id,
            x,
            y,
        
            // Required shape (minimal rectangle works best for pure text)
            shape: {
                type: foundry.data.ShapeData.TYPES.RECTANGLE,
                width: this.LABEL_WIDTH,
                height: this.LABEL_HEIGHT,
                radius: 1,
                points: []
            },
        
            text,
            textColor,
            fontSize,
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
                    const coordinates = Utils.getHexCenterPosition(column, row);
                    const label = Utils.getHexCoordinates(column, row);
                    // , coordinates.x, coordinates.y + (9 / 10) * Constants.HEX_VERTICAL_RADIUS);
                    // labels.push(this.getTextLabel(Utils.getHexCoordinates(column, row), coordinates.x, coordinates.y + (9 / 10) * Constants.HEX_VERTICAL_RADIUS));
                    labels.push(this.getTextLabel(label, coordinates.x- this.OFFSET_X, coordinates.y - this.OFFSET_Y + (9 / 10) * Constants.HEX_VERTICAL_RADIUS, 16, "#bababa"));
                    // Debug label for coordinates in center of hex
                    //labels.push(this.getTextLabel(`${coordinates.x},${coordinates.y}`, coordinates.x, coordinates.y));
                }
            }
        }

        if (options.generateHexName) {
            sectorTree.root.children
                .filter(node => node.type !== 'note')
                .forEach(node => {
                    const system = node.entity;
                    const coordinates = Utils.getHexCenterPosition(system.x - 1, system.y - 1);
                    // Hex name label at top of hex (subtract from y), centered horizontally
                    // Names with spaces are shifted down slightly
                    let yOffset = node.entity.name?.indexOf(" ") > 0 ?  (7.5 / 10) * Constants.HEX_VERTICAL_RADIUS : (9 / 10) * Constants.HEX_VERTICAL_RADIUS;
                    labels.push(this.getTextLabel(node.entity.name, coordinates.x - this.OFFSET_X, coordinates.y - this.OFFSET_Y - yOffset, 16));

                    //labels.push(this.getTextLabel(node.entity.name, coordinates.x, coordinates.y - (9 / 10) * Constants.HEX_VERTICAL_RADIUS));
                });
        }

        return labels;
    }

}
