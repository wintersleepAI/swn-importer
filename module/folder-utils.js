import { TreeNode } from './model/tree-node.js';
import { Utils } from './utils.js';
import { Options } from './model/options.js';

export class FolderUtils {
    /**
     * Gets a Foundry Folder Data object to generate a folder for an entity
     * @param node The tree node to generate a folder for
     * @param options The options object
     * @returns The Foundry Folder Data
     */
    static getFolderData(node, options, addTimestamp) {
        let name;
        const parent = FolderUtils.getContainingFolder(node);

        switch (node.type) {
            case 'system':
            case 'blackHole':
                name = options.prefixSystemFoldersWithCoordinates ? `[${node.coordinates}] ${node.entity.name}` : node.entity.name;
                break;
            default:
                name = node.entity.name;
                break;
        }

        if (addTimestamp) {
            name = Utils.getTimestampedName(Folders.instance, name);
        }

        return {
            name,
            type: "JournalEntry",
            parent: parent?.id,
            flags: Utils.getNodeFlags(node),
        };
    }

    /**
     * Get the containing folder of an entity, going up the hierarchy if necessary
     * @param node The node to find the folder for
     * @returns The Foundry folder or undefined if not found
     */
    static getContainingFolder(node) {
        if (node.folder) {
            return node.folder;
        } else {
            if (node.parent) {
                return FolderUtils.getContainingFolder(node.parent);
            } else {
                return undefined;
            }
        }
    }
}
