import { Constants } from './constants.js';
import { Coordinates } from  './model/coordinates.js';
import { IconPosition } from './model/icon-position.js';
import { Options } from './model/options.js';
import { PositionedEntity } from './model/positioned-entity.js';
import { SectorData } from './model/sector-data.js';
import { SectorTree } from './model/sector-tree.js';
import { TreeNode } from './model/tree-node.js';
import { Utils } from './utils.js';

export class NoteUtils {

    /**
     * Gets a Foundry Note Data list to generate scene pins for a system/blackhole
     * @param node The tree node to generate pins for
     * @param options The options object
     * @returns The Foundry Note Data list
     */
    static getSectorNotes(sectorTree, options) {
        const notes = [];

        sectorTree.root.children.forEach(node => {
            notes.push(...this.getSystemNotes(node, options));
        });

        return notes;
    }

    /**
     * Gets the icon path that represents an entity type
     * @param type The type of entity
     * @param options The options object
     * @returns The icon path
     */
    static getEntityIcon(type, options) {
        return options[type + "Path"];
    }

    static getSystemNotes(system, options) {
        let nodes;

        if (options.generateNotesForAllEntities) {
            nodes = Utils.traversal(system, 'preorder');
        } else {
            nodes = [system, ...system.children];
        }

        const notes = nodes
            .filter(node => node.type !== 'note')
            .map((node, index, list) => this.createEntityNote(node, list.length, index, options))
            .reverse();

        return notes;
    }

    static createEntityNote(node, entityCount, entityIndex, options) {
        const iconPosition = this.getIconPosition(node, entityCount, entityIndex, options);

        const note = {
            _id: foundry.utils.randomID(),
            entryId: node.journal?.id,
            iconSize: 32,
            texture: {
                src: this.getEntityIcon(node.type, options),
                anchorX: 0.5,
                anchorY: 0.5,
                offsetX: 0,
                offsetY: 0,
                fit: "contain",
            },
            text: node.entity.name?.length > 0 ? node.entity.name : Utils.getTypeName(node.type),
            textAnchor: foundry.CONST.TEXT_ANCHOR_POINTS.CENTER,
            flags: Utils.getNodeFlags(node),
            x: iconPosition.x,
            y: iconPosition.y
        };

        return note;
    }

    static getIconPosition(node, entityCount, entityIndex, options) {
        const parent = Utils.getContainingSystem(node).entity;
        const center = Utils.getHexCenterPosition(parent.x - 1, parent.y - 1);

        let offset = { x: 0, y: 0 };
        let tooltipPosition = foundry.CONST.TEXT_ANCHOR_POINTS.CENTER;

        const orbitingEntities = entityCount - 1;
        const orbitingEntityIndex = entityIndex - 1;

        if (entityIndex !== 0) {
            const step = (2 * Math.PI) / orbitingEntities;
            const angle = orbitingEntityIndex * step;

            if (angle <= (1 / 4) * Math.PI) {
                tooltipPosition = foundry.CONST.TEXT_ANCHOR_POINTS.RIGHT;
            } else if (angle <= (3 / 4) * Math.PI) {
                tooltipPosition = foundry.CONST.TEXT_ANCHOR_POINTS.BOTTOM;
            } else if (angle <= (5 / 4) * Math.PI) {
                tooltipPosition = foundry.CONST.TEXT_ANCHOR_POINTS.LEFT;
            } else if (angle <= (7 / 4) * Math.PI) {
                tooltipPosition = foundry.CONST.TEXT_ANCHOR_POINTS.TOP;
            } else {
                tooltipPosition = foundry.CONST.TEXT_ANCHOR_POINTS.RIGHT;
            }

            offset = this.getEntityOffset(angle);
        }

        return {
            x: center.x + offset.x,
            y: center.y + offset.y,
            tooltipPosition
        };
    }

    static getEntityOffset(angle) {
        const x = Math.cos(angle) * Constants.ORBITING_DISTANCE;
        const y = Math.sin(angle) * Constants.ORBITING_DISTANCE;

        return { x, y };
    }

}
