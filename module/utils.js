import { Constants } from './constants.js';
import { Attributes } from './model/attributes.js';
import { BaseEntity } from './model/base-entity.js';
import { DisplayList } from './model/display-list.js';
import { DisplayTag } from './model/display-tag.js';
import { PositionedEntity } from './model/positioned-entity.js';
import { SectorData } from './model/sector-data.js';
import { SectorTree } from './model/sector-tree.js';
import { Tag } from './model/tag.js';
import { TreeNode } from './model/tree-node.js';
import { TreeTag } from './model/tree-tag.js';

export class Utils {

    /**
     * Get a localized label from the module i18m tables
     * @param name The label key
     * @returns The localized label
     */
    static getLabel(name) {
        return game.i18n.localize(Constants.LOCALIZATION_NAMESPACE + "." + name);
    }

    /**
     * Get a localized entity type name
     * @param type The entity type
     * @returns The localized entity type name
     */
    static getTypeName(type) {
        switch (type) {
            case 'asteroidBase':
                return Utils.getLabel("ASTEROID-BASE");
            case 'asteroidBelt':
                return Utils.getLabel("ASTEROID-BELT");
            case 'blackHole':
                return Utils.getLabel("BLACK-HOLE");
            case 'deepSpaceStation':
                return Utils.getLabel("DEEP-SPACE-STATION");
            case 'gasGiantMine':
                return Utils.getLabel("GAS-GIANT-MINE");
            case 'moon':
                return Utils.getLabel("MOON");
            case 'moonBase':
                return Utils.getLabel("MOON-BASE");
            case 'orbitalRuin':
                return Utils.getLabel("ORBITAL-RUIN");
            case 'planet':
                return Utils.getLabel("PLANET");
            case 'refuelingStation':
                return Utils.getLabel("REFUELING-STATION");
            case 'researchBase':
                return Utils.getLabel("RESEARCH-BASE");
            case 'sector':
                return Utils.getLabel("SECTOR");
            case 'spaceStation':
                return Utils.getLabel("SPACE-STATION");
            case 'system':
                return Utils.getLabel("SYSTEM");
            default:
                return "";
        }
    }

    /**
     * Get a localized label with parameters from the module i18m tables
     * @param name The label key
     * @param data The data for the label parameters
     * @returns The localized label
     */
    static formatLabel(name, data) {
        return game.i18n.format(Constants.LOCALIZATION_NAMESPACE + "." + name, data);
    }


    static getHexCenterPosition(column, row) {
        let verticalOffset = 0;

        if (column % 2 === 0) {
            verticalOffset = Constants.HEX_VERTICAL_RADIUS;
        } else {
            verticalOffset = 2 * Constants.HEX_VERTICAL_RADIUS;
        }

        return {
            x: Math.floor(((3 / 4) * Constants.HEX_WIDTH * column) + Constants.HEX_RADIUS),
            y: Math.floor((Constants.HEX_HEIGHT * row) + Constants.HEX_VERTICAL_RADIUS + verticalOffset)
        }
    }


    /**
     * Get the Foundry flags for a SWN entity
     * @param node The node to generate flags for
     * @returns The Foundry flags
     */
    static getNodeFlags(node) {
        const flags = {};
        flags[Constants.MODULE_ID + "." + "id"] = node.id;
        flags[Constants.MODULE_ID + "." + "type"] = node.type;
        return flags;
    }

    /**
     * Get the Foundry flags for a SWN tag
     * @param node The tag to generate flags for
     * @returns The Foundry flags
     */
    static getTagFlags(tagNode) {
        const flags = {};
        flags[Constants.MODULE_ID + "." + "id"] = tagNode.tag.name;
        return flags;
    }

    /**
     * Get the SWN id of a Foundry entity
     * @param entity The entity to get the id for
     * @returns The entity SWN id
     */
    static getIdFlag(entity) {
        return entity.getFlag(Constants.MODULE_ID, "id");
    }

    /**
     * Get all nodes from a root node preordered or postordered
     * @param node The root node of the traversal
     * @param strategy The type of traversal (preorder + children | postorder + root)
     * @returns A list with the node and all its children traversed with the specified strategy
     */
    static traversal(node, strategy) {
        const list = [];

        switch (strategy) {
            case 'postorder':
                node.children.forEach(child => {
                    list.push(...this.traversal(child, strategy));
                });
                list.push(node);
                break;
            case 'preorder':
                list.push(node);
                node.children.forEach(child => {
                    list.push(...this.traversal(child, strategy));
                });
                break;
        }

        return list;
    }

    /**
     * Convert a Foundry create/update response to a list of created/updated entities
     * @param entities An object, object array or null
     * @returns A list with the the object or objects (or empty)
     */
    static getAsList(entities) {
        if (entities) {
            if (entities instanceof Array) {
                return entities;
            } else {
                return [entities];
            }
        } else {
            return [];
        }
    }

    /**
     * Execute a function on every entity of an imported sector of specified types
     * @param sectorData The sector data to visit
     * @param types The entity types that will be visited
     * @param consumer The function to be executed on every visited entity
     */
    static forEachEntity(sectorData, types, consumer) {
        this.forEachEntityType(sectorData, types, (type, map) => {
            for (const x in map) {
                consumer(x, map[x], type);
            }
        });
    }

    /**
     * Get a hex coordinates
     * @param column Zero-based grid column
     * @param row Zero-based grid row
     * @returns The coordinates of the hex
     */
    static getHexCoordinates(column, row) {
        const xt = column < 10 ? "0" + column : String(column);
        const yt = row < 10 ? "0" + row : String(row);
        return xt + yt;
    }

    /**
     * Get a module image path
     * @param name The image name
     * @returns The image path
     */
    static getImagePath(name) {
        return `modules/${Constants.MODULE_ID}/images/${name}`;
    }

    /**
     * Get a module template path
     * @param name The template name
     * @returns The template path
     */
    static getTemplatePath(name) {
        return `modules/${Constants.MODULE_ID}/templates/${name}`;
    }

    /**
     * Convert a sector data to a map of tree nodes indexed by the entity key
     * @param sectorData The sector data to be parsed
     * @returns A map with all sector entities*/
    static getDataAsNodeMap(sectorData) {
        const nodeMap = new Map();
        Utils.forEachEntity(sectorData, "all", (k, e, t) => {
            const node = {
                id: k,
                entity: e,
                type: t,
                coordinates: ('x' in e) ? Utils.getSystemCoordinates(e) : undefined,
                children: [],
                parent: null
            };
            nodeMap.set(k, node);
        });
        return nodeMap;
    }

    /**
     * Modify every unlinked node of the map to create a node tree by the entity.parent property
     * @param nodeMap The node map to parse
     */
    static linkTreeNodes(nodeMap) {
        nodeMap.forEach(node => {
            if (node.entity.parent) {
                const parent = nodeMap.get(node.entity.parent);
                if (parent) {
                    if (!parent.children.includes(node)) {
                        parent.children.push(node);
                    }
                    node.parent = parent;
                }
            }
        });
    }

    /**
     * Get a localized label of the attribute name
     * @param name The attribute name
     * @returns The localized name of the attribute
     */
    static getAttributeName(name) {
        switch (name) {
            case 'occupation':
                return Utils.getLabel("ATTRIBUTE-OCCUPATION");
            case 'situation':
                return Utils.getLabel("ATTRIBUTE-SITUATION");
            case 'atmosphere':
                return Utils.getLabel("ATTRIBUTE-ATMOSPHERE");
            case 'biosphere':
                return Utils.getLabel("ATTRIBUTE-BIOSPHERE");
            case 'population':
                return Utils.getLabel("ATTRIBUTE-POPULATION");
            case 'techLevel':
                return Utils.getLabel("ATTRIBUTE-TECHNOLOGY-LEVEL");
            case 'temperature':
                return Utils.getLabel("ATTRIBUTE-TEMPERATURE");
            default:
                return name;
        }
    }

    /**
     * Get a localized label of the tag list name
     * @param name The tag list
     * @returns The localized name of the tag list
     */
    static getTagListName(name) {
        switch (name) {
            case 'complications':
                return Utils.getLabel("TAG-COMPLICATIONS");
            case 'enemies':
                return Utils.getLabel("TAG-ENEMIES");
            case 'friends':
                return Utils.getLabel("TAG-FRIENDS");
            case 'places':
                return Utils.getLabel("TAG-PLACES");
            case 'things':
                return Utils.getLabel("TAG-THINGS");
            default:
                return name;
        }
    }

    /**
     * Traverse all node ascendants of the current node to find its containing system/blackhole
     * @param node The leaf entity node
     * @returns The tree node representing the containing system/blackhole of the node (including itself)
    */
    static getContainingSystem(node) {
        if (node.type === 'system' || node.type === 'blackHole') {
            return node;
        } else {
            if (node.parent) {
                return this.getContainingSystem(node.parent);
            }
        }

        throw new Error("Couldnt find containing system of " + node.id);
    }

    /**
     * Finds the distance between a node and a descendant node
     * @param ascendant The ascendant node
     * @param descendant The descendant node
     * @returns The distance between nodes
     */
    static getDistance(ascendant, descendant) {
        if (ascendant === descendant) {
            return 0;
        } else {
            if (descendant.parent) {
                return this.getDistance(ascendant, descendant.parent) + 1;
            }
        }

        throw new Error("Entities are not linked: " + ascendant.id + " - " + descendant.id);
    }

    /**
     * Find out if a node is the last child of its parent
     * @param node The node to evaluate
     * @returns True if this node is the last child of its parent
     */
    static isLastChild(node) {
        if (node.parent) {
            const siblings = node.parent.children;
            return node === siblings[siblings.length - 1];
        }

        return false;
    }

    /**
     * Gets all the distinct tags of a node list into a map
     * @param nodeList The node list to process
     * @returns A map with the tag name and content
     */
    static getTagMap(nodeList) {
        const tagMap = new Map();
        nodeList.forEach(node => {
            if (node.entity && node.entity.attributes && node.entity.attributes.tags) {
                node.entity.attributes.tags.forEach(tag => {
                    if (!tagMap.has(tag.name)) {
                        tagMap.set(tag.name, { id: tag.name, tag: tag, displayTag: Utils.getDisplayTag(tag), journal: null });
                    }
                });
            }
        });
        return tagMap;
    }

    /**
     * Get the values of a map into a list
     * @param map The map to parse
     * @returns A list with all values in the map
     */
    static getValueList(map) {
        const result = [];
        map.forEach(value => result.push(value));
        return result;
    }

    /**
     * Gets a list of display tags for a given entity
     * @param sectorTree The sector tree
     * @param node The node to get the tags for
     * @returns The list of display tags for the node
     */
    static getEntityDisplayTags(sectorTree, node) {
        if (node && node.entity && node.entity.attributes && node.entity.attributes.tags) {
            return node.entity.attributes.tags
                .map(t => sectorTree.tagMap.get(t.name))
                .filter(t => t !== undefined)
                .map(t => t?.displayTag);
        }
        return undefined;
    }

    /**
     * Returns a unique name for an entity, timestamping the name if necessary
     * @param collection The collection to check
     * @param name The entity name to check
     * @returns The name if not found, or else the name with a timestamp
     */
    static getTimestampedName(collection, name) {
        if (collection) {
            if (collection.getName(name)) {
                name = `${name} (${(new Date()).toLocaleString()})`;
            }
        }
        return name;
    }

    static formatAsHTML(text) {
        if (text) {
            return text.replace(new RegExp('\\n', 'g'), "<br/>");
        } else {
            return "";
        }
    }

    static getDisplayTag(tag) {
        const lists = [];

        for (const key in tag) {
            if (key !== 'types' && tag[key] instanceof Array) {
                lists.push({
                    name: Utils.getTagListName(key),
                    elements: tag[key]
                });
            }
        }

        return {
            name: tag.name || '',
            description: tag.description || '',
            lists: lists,
            link: null
        };
    }

    static forEachEntityType(sectorData, types, consumer) {
        let entities;

        switch (types) {
            case 'all':
                entities = ['asteroidBase', 'asteroidBelt', 'blackHole', 'deepSpaceStation', 'gasGiantMine', 'moon', 'moonBase', 'note', 'orbitalRuin', 'planet', 'refuelingStation', 'researchBase', 'sector', 'spaceStation', 'system'];
                break;
            case 'only-basic':
                entities = ['asteroidBase', 'asteroidBelt', 'deepSpaceStation', 'gasGiantMine', 'moon', 'moonBase', 'orbitalRuin', 'planet', 'refuelingStation', 'researchBase', 'spaceStation'];
                break;
            case 'only-systems':
                entities = ['blackHole', 'system'];
                break;
        }

        entities.forEach(type => {
            const map = sectorData[type];
            if (map) {
                consumer(type, map);
            }
        });
    }

    static getSystemCoordinates(system) {
        return this.getHexCoordinates(system.x - 1, system.y - 1);
    }

    // generate a new unique id like npKF4D1snpeCxSu1
    static getNewId() {
        return `si${Math.random().toString(36).substring(2, 15)}`;
    }
}
