import { FolderUtils } from './folder-utils.js';
import { AttributeEntry } from './model/attribute-entry.js';
import { Attributes } from './model/attributes.js';
import { DiagramEntry } from './model/diagram-entry.js';
import { DisplayChild } from './model/display-child.js';
import { DisplayEntity } from './model/display-entity.js';
import { DisplayTag } from './model/display-tag.js';
import { Options } from './model/options.js';
import { SectorTree } from './model/sector-tree.js';
import { TreeNode } from './model/tree-node.js';
import { TreeTag } from './model/tree-tag.js';
import { NoteUtils } from './note-utils.js';
import { TemplateUtils } from './template-utils.js';
import { Utils } from './utils.js';

export class JournalUtils {

    /**
     * Gets a Foundry Journal Data object to generate an empty journal for an entity
     * @param node The tree node to generate an empty journal for
     * @param options The options object
     * @returns The Foundry Journal Data
     */
    static getEmptyJournalData(node, options) {
        const hidden = (options.onlyGMJournals || node.entity.isHidden);
        const permission = {
            default: hidden ? CONST.DOCUMENT_PERMISSION_LEVELS.NONE : CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER
        };

        const name = options.addTypeToEntityJournal ? `[${Utils.getTypeName(node.type)}] ${node.entity.name}` : node.entity.name;
        const folder = FolderUtils.getContainingFolder(node)?.id;

        const journal = {
            name,
            folder,
            flags: Utils.getNodeFlags(node),
            permission,
            pages: pages ? [{ name: 'Image', type: 'image', src }] : []
        };

        return journal;
    }

    /**
     * Gets a Foundry Journal Data object to update an existing journal for an entity
     * @param sectorTree The sector tree
     * @param node The tree node to generate a journal update for
     * @param options The options object
     * @returns The Foundry Journal update Data (promise)
     */
    static async getUpdateJournalData(sectorTree, node, options) {
        if (node.journal) {
            const templateData = JournalUtils.getTemplateData(sectorTree, node, options);
            const content = await TemplateUtils.renderJournalContent(node.type, templateData);

            const updateData = {
                _id: node.journal.id,
                name: options.addTypeToEntityJournal ? `[${Utils.getTypeName(node.type)}] ${node.entity.name}` : node.entity.name,
                pages: [
                    {
                        name: { content }
                    }
                ]
            };

            return updateData;
        } else {
            throw new Error("Couldn't find the journal for the entity " + node.id);
        }
    }

    /**
     * Gets a Foundry Journal Data object to generate a journal for a tag
     * @param tag The tag to create a journal entry for
     * @param folder The folder to put the journal into
     */
    static async getTagJournalData(tagNode, folder) {
        const journal = {
            name: tagNode.displayTag.name,
            folder: folder?.id,
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER }
        };

        return journal;
    }

    static getTemplateData(sectorTree, node, options) {
        const system = (node.type !== 'sector') ? Utils.getContainingSystem(node) : null;

        const children = node.children
            .filter(child => child.type !== 'note')
            .map(child => {
                const childData = {
                    link: child.journal?.link || '',
                    coordinates: Utils.getLocationWithinParent(child)
                };
                return childData;
            });

        const attributes = [];

        let tags;
        let description;

        const notes = node.children
            .filter(child => child.type === 'note')
            .map(child => { return { name: child.entity.attributes.content } });

        for (const key in node.entity.attributes) {
            const attributeName = key;
            switch (attributeName) {
                case 'description':
                    description = Utils.formatAsHTML(node.entity.attributes.description);
                    break;
                case 'tags':
                    tags = Utils.getEntityDisplayTags(sectorTree, node);
                    break;
                default:
                    attributes.push({
                        name: Utils.getAttributeName(attributeName),
                        description: String(node.entity.attributes[attributeName])
                    });
                    break;
            }
        }

        const includeSystemLink = (!!system && system !== node && system !== node.parent);

        const data = {
            name: node.entity.name,
            attributes,
            description,
            notes,
            image: !options.addTypeToEntityJournal,
            type: Utils.getTypeName(node.type),
            location: Utils.getLocationWithinParent(node),
            parentLink: node.parent ? node.parent.journal?.link : (includeSystemLink && system) ? system.journal?.link : null
        };

        return data;

    }

    static getLocationWithinParent(node) {
        if (!node.parent) {
            // surely it's a system?!??
            return undefined;
        } else {
            switch (node.parent.type) {
                case 'asteroidBelt':
                    // TODO!
                    return Utils.getLabel("JOURNAL-IN-AN-ASTEROID");
                case 'sector':
                    return Utils.getLabel("JOURNAL-IN");
                case 'blackHole':
                case 'system':
                    return Utils.getLabel("JOURNAL-IN-ORBIT-AROUND");
                case 'moon':
                case 'planet':
                    if (node.type === 'moonBase' || node.type === 'researchBase') {
                        return Utils.getLabel("JOURNAL-ON-THE-SURFACE");
                    } else {
                        return Utils.getLabel("JOURNAL-IN-ORBIT-AROUND");
                    }
                default:
                    return "in";
            }
        }
    }

    static generateDiagram(sectorTree, diagramRoot, options) {
        const entities = Utils.traversal(diagramRoot, 'preorder').filter(n => n.type !== 'note');

        if (entities.length > 1) {
            return entities.map((node) => {
                const indentation = [];
                const distance = Utils.getDistance(diagramRoot, node);
                for (let i = 0; i < distance; i++) {
                    if (i === distance - 1) {
                        if (Utils.isLastChild(node)) {
                            indentation.push('└');
                        } else {
                            indentation.push('├');
                        }
                    } else {
                        indentation.push('│');
                    }
                }
                return {
                    indentation: indentation.join(''),
                    image: NoteUtils.getEntityIcon(node.type, options),
                    link: (diagramRoot !== node) ? node.journal?.link : (!options.addTypeToEntityJournal ? Utils.getTypeName(node.type) : node.entity.name)
                };
            });
        }

        return [];
    }

}
